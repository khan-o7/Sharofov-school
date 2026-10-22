import { db } from '@/lib/db';
import { sendTelegramLog, sendTelegramError } from '@/lib/telegram';

// In-memory rate limiting map for login lockout
type AttemptRecord = {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout

export function checkLockout(ip: string = 'global'): { locked: boolean; retryAfter: number } {
  const record = loginAttempts.get(ip);
  if (!record) return { locked: false, retryAfter: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { locked: true, retryAfter };
  }

  // If lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginAttempts.delete(ip);
    return { locked: false, retryAfter: 0 };
  }

  return { locked: false, retryAfter: 0 };
}

export function recordFailedAttempt(ip: string = 'global'): { locked: boolean; retryAfter: number; attemptsLeft: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lastAttempt: now, lockedUntil: 0 };

  // If previous attempt was more than 10 minutes ago, reset counter
  if (now - record.lastAttempt > 10 * 60 * 1000 && record.lockedUntil <= now) {
    record.count = 0;
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    loginAttempts.set(ip, record);
    return { locked: true, retryAfter: 60, attemptsLeft: 0 };
  }

  loginAttempts.set(ip, record);
  return { locked: false, retryAfter: 0, attemptsLeft: MAX_ATTEMPTS - record.count };
}

export function clearFailedAttempts(ip: string = 'global') {
  loginAttempts.delete(ip);
}

/**
 * Get current active admin credentials (from DB or fallback to env)
 */
export async function getAdminCredentials(): Promise<{ username: string; password: string }> {
  try {
    const client = db();
    const { data } = await client
      .from('referrals')
      .select('owner_name, owner_student_id')
      .eq('code', '__admin_config__')
      .maybeSingle();

    if (data?.owner_name && data?.owner_student_id) {
      return {
        username: data.owner_name,
        password: data.owner_student_id,
      };
    }
  } catch (err) {
    console.error('getAdminCredentials error:', err);
  }

  // Fallback to environment variables
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '20042802',
  };
}

/**
 * Save updated admin credentials to DB and notify @uzb_c0de
 */
export async function updateAdminCredentials(newUsername: string, newPassword: string, source: string = 'Admin Panel'): Promise<boolean> {
  try {
    const client = db();
    const { error } = await client.from('referrals').upsert(
      {
        code: '__admin_config__',
        owner_name: newUsername.trim(),
        owner_student_id: newPassword.trim(),
        is_active: false,
      },
      { onConflict: 'code' }
    );

    if (error) {
      console.error('updateAdminCredentials error:', error);
      void sendTelegramError('Admin Credentials Update', error);
      return false;
    }

    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const notification =
      `🔐 <b>Admin Login va Paroli Yangilandi!</b>\n\n` +
      `📌 <b>O‘zgartirilgan joy:</b> ${source}\n` +
      `👤 <b>Yangi Login:</b> <code>${newUsername}</code>\n` +
      `🔑 <b>Yangi Parol:</b> <code>${newPassword}</code>\n` +
      `⏰ <b>Vaqt:</b> ${now}`;

    void sendTelegramLog(notification);
    return true;
  } catch (e) {
    console.error('updateAdminCredentials exception:', e);
    void sendTelegramError('Admin Credentials Update Exception', e);
    return false;
  }
}

/**
 * Generate 6-digit password reset code, save to DB, and send to @uzb_c0de
 */
export async function sendPasswordResetCode(): Promise<{ ok: boolean; error?: string }> {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const client = db();
    const { error } = await client.from('referrals').upsert(
      {
        code: '__admin_reset_code__',
        owner_name: code,
        owner_student_id: expiresAt.toString(),
        is_active: false,
      },
      { onConflict: 'code' }
    );

    if (error) {
      console.error('sendPasswordResetCode DB error:', error);
      return { ok: false, error: 'Kodni saqlashda xatolik yuz berdi.' };
    }

    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const notification =
      `🔑 <b>ADMIN PAROLINI TIKLASH SO‘ROVI!</b>\n\n` +
      `Saytda admin parolini tiklash so‘raldi.\n\n` +
      `🔢 <b>Tasdiqlash Kodi:</b> <code>${code}</code>\n` +
      `⏳ <b>Amal qilish muddati:</b> 10 daqiqa\n` +
      `⏰ <b>Vaqt:</b> ${now}`;

    await sendTelegramLog(notification);
    return { ok: true };
  } catch (e) {
    console.error('sendPasswordResetCode error:', e);
    return { ok: false, error: 'Telegram orqali kod yuborishda xatolik.' };
  }
}

/**
 * Verify 6-digit code and set new credentials
 */
export async function resetAdminCredentialsWithCode(
  inputCode: string,
  newUsername: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = db();
    const { data, error } = await client
      .from('referrals')
      .select('owner_name, owner_student_id')
      .eq('code', '__admin_reset_code__')
      .maybeSingle();

    if (error || !data) {
      return { ok: false, error: 'Tiklash kodi topilmadi yoki eskirgan. Qaytadan kod so‘rang.' };
    }

    const expectedCode = data.owner_name;
    const expiresAt = Number(data.owner_student_id);

    if (Date.now() > expiresAt) {
      return { ok: false, error: 'Kodning amal qilish vaqti (10 daqiqa) tugagan. Yangi kod so‘rang.' };
    }

    if (expectedCode.trim() !== inputCode.trim()) {
      return { ok: false, error: 'Kiritilgan tasdiqlash kodi noto‘g‘ri!' };
    }

    // Success: Update credentials
    const updated = await updateAdminCredentials(newUsername, newPassword, 'Parolni Tiklash (Telegram Kod orqali)');
    if (!updated) {
      return { ok: false, error: 'Ma’lumotlarni yangilashda xatolik yuz berdi.' };
    }

    // Delete used code
    await client.from('referrals').delete().eq('code', '__admin_reset_code__');

    return { ok: true };
  } catch (e) {
    console.error('resetAdminCredentialsWithCode error:', e);
    return { ok: false, error: 'Serverda xatolik yuz berdi.' };
  }
}
