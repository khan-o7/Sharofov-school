import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSession } from '@/lib/session';
import { sendTelegramLog, sendTelegramError } from '@/lib/telegram';

const schema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(300),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Login va parolni kiriting.' }, { status: 400 });
    }

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (
      !expectedUser ||
      !expectedPassword ||
      parsed.data.username !== expectedUser ||
      parsed.data.password !== expectedPassword
    ) {
      const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
      void sendTelegramLog(
        `⚠️ <b>Xavfsizlik Ogohlantirishi!</b>\n\n` +
        `Admin paneliga kirishda noto‘g‘ri ma’lumot kiritildi:\n` +
        `Login: <code>${parsed.data.username}</code>\n` +
        `⏰ Vaqt: ${now}`
      );
      return NextResponse.json({ error: 'Login yoki parol noto‘g‘ri.' }, { status: 401 });
    }

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

