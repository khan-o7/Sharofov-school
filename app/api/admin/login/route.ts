import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSession } from '@/lib/session';
const schema = z.object({ username:z.string().min(1).max(100), password:z.string().min(1).max(300) });
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error:'Login va parolni kiriting.' }, { status:400 });
    const expectedUser = process.env.ADMIN_USERNAME; const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPassword || parsed.data.username !== expectedUser || parsed.data.password !== expectedPassword) return NextResponse.json({ error:'Login yoki parol noto‘g‘ri.' }, { status:401 });
    await createAdminSession(); return NextResponse.json({ ok:true });
  } catch (e) { return NextResponse.json({ error:e instanceof Error ? e.message : 'Kirish xatosi.' }, { status:500 }); }
}
