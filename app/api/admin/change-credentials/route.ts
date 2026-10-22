import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/session';
import { getAdminCredentials, updateAdminCredentials } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  currentPassword: z.string().min(1, 'Joriy parolni kiriting'),
  newUsername: z.string().min(3, 'Yangi login kamida 3 belgidan iborat bo‘lsin').max(50),
  newPassword: z.string().min(4, 'Yangi parol kamida 4 belgidan iborat bo‘lsin').max(100),
});

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Avtorizatsiyadan o‘ting).' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Noto‘g‘ri ma’lumot formati';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { currentPassword, newUsername, newPassword } = parsed.data;

    // Verify current password
    const currentCreds = await getAdminCredentials();
    if (currentPassword !== currentCreds.password) {
      return NextResponse.json({ error: 'Joriy parol noto‘g‘ri kiritildi!' }, { status: 400 });
    }

    // Save new credentials
    const success = await updateAdminCredentials(newUsername, newPassword, 'Admin Boshqaruv Paneli (Sozlamalar)');
    if (!success) {
      return NextResponse.json({ error: 'Ma’lumotlarni yangilashda xatolik yuz berdi.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Login va parol muvaffaqiyatli yangilandi hamda Telegram (@uzb_c0de) orqali xabar berildi!',
      username: newUsername,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Serverda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
