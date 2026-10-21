import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyTelegramLogin } from '@/lib/telegram';
import { createTelegramSession } from '@/lib/session';
const schema = z.object({ id:z.number().int().positive(), first_name:z.string().optional(), last_name:z.string().optional(), username:z.string().optional(), photo_url:z.string().optional(), auth_date:z.number().int(), hash:z.string().length(64) });
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success || !verifyTelegramLogin(parsed.data)) return NextResponse.json({ error:'Telegram identifikatsiyasi yaroqsiz yoki muddati o‘tgan.' }, { status:401 });
    await createTelegramSession(parsed.data.id);
    return NextResponse.json({ ok:true, userId:parsed.data.id });
  } catch (e) { return NextResponse.json({ error:e instanceof Error ? e.message : 'Server xatosi' }, { status:500 }); }
}
