import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetCode, resetAdminCredentialsWithCode } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const sendCodeSchema = z.object({
  action: z.literal('send_code'),
});

const resetSchema = z.object({
  action: z.literal('verify_and_reset'),
  code: z.string().min(4).max(10),
  newUsername: z.string().min(3, 'Login kamida 3 belgidan iborat bo‘lsin').max(50),
  newPassword: z.string().min(4, 'Parol kamida 4 belgidan iborat bo‘lsin').max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'send_code') {
      const parsed = sendCodeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Noto‘g‘ri so‘rov' }, { status: 400 });
      }

      const result = await sendPasswordResetCode();
      if (!result.ok) {
        return NextResponse.json({ error: result.error || 'Kod yuborilmadi.' }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        message: 'Tasdiqlash kodi Telegram bot orqali @uzb_c0de akkauntiga yuborildi!',
      });
    }

    if (body.action === 'verify_and_reset') {
      const parsed = resetSchema.safeParse(body);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message || 'Ma’lumotlar to‘liq kiritilmadi';
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      const { code, newUsername, newPassword } = parsed.data;
      const result = await resetAdminCredentialsWithCode(code, newUsername, newPassword);

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        message: 'Login va parol muvaffaqiyatli tiklandi va yangilandi! Yangi ma’lumotlar bilan tizimga kirishingiz mumkin.',
      });
    }

    return NextResponse.json({ error: 'Noma’lum amal.' }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Serverda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
