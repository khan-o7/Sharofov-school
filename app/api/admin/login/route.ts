import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSession } from '@/lib/session';
import { sendTelegramLog, sendTelegramError } from '@/lib/telegram';
import {
  getAdminCredentials,
  checkLockout,
  recordFailedAttempt,
  clearFailedAttempts,
} from '@/lib/admin-auth';

const schema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(300),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'client';

    // 1. Check if IP is currently locked out
    const lockout = checkLockout(ip);
    if (lockout.locked) {
      return NextResponse.json(
        {
          error: `Xavfsizlik cheklovi: 5 marta ketma-ket xato kiritildi. Iltimos, ${lockout.retryAfter} soniya kuting.`,
          locked: true,
          retryAfter: lockout.retryAfter,
        },
        { status: 429 }
      );
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Login va parolni kiriting.' }, { status: 400 });
    }

    // 2. Fetch active credentials (from Supabase or fallback to env)
    const { username: expectedUser, password: expectedPassword } = await getAdminCredentials();

    if (
      parsed.data.username !== expectedUser ||
      parsed.data.password !== expectedPassword
    ) {
      const attemptRes = recordFailedAttempt(ip);
      const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

      if (attemptRes.locked) {
        void sendTelegramLog(
          `🚨 <b>XAVFSIZLIK: Admin Tizimi 1 Daqiqaga Bloklandi!</b>\n\n` +
          `5 marta ketma-ket noto‘g‘ri parol kiritildi!\n` +
          `Oxirgi kiritilgan login: <code>${parsed.data.username}</code>\n` +
          `⏰ Vaqt: ${now}`
        );

        return NextResponse.json(
          {
            error: '5 marta xato kiritildi! Xavfsizlik yuzasidan tizim 1 daqiqaga bloklandi.',
            locked: true,
            retryAfter: 60,
          },
          { status: 429 }
        );
      }

      void sendTelegramLog(
        `⚠️ <b>Admin Loginida Xatolik!</b>\n\n` +
        `Noto‘g‘ri login yoki parol kiritildi:\n` +
        `Kiritilgan login: <code>${parsed.data.username}</code>\n` +
        `Qolgan urinishlar: <b>${attemptRes.attemptsLeft} ta</b>\n` +
        `⏰ Vaqt: ${now}`
      );

      return NextResponse.json(
        {
          error: `Login yoki parol noto‘g‘ri. Qolgan urinishlar: ${attemptRes.attemptsLeft} ta.`,
          attemptsLeft: attemptRes.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // 3. Clear failed attempts on successful login
    clearFailedAttempts(ip);
    await createAdminSession();

    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    void sendTelegramLog(
      `🔐 <b>Admin Tizimga Muvaffaqiyatli Kirdi!</b>\n\n` +
      `Foydalanuvchi: <code>${parsed.data.username}</code>\n` +
      `⏰ Vaqt: ${now}`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    void sendTelegramError('API: /api/admin/login', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Kirish xatosi.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'client';
  const lockout = checkLockout(ip);
  return NextResponse.json({
    locked: lockout.locked,
    retryAfter: lockout.retryAfter,
  });
}



