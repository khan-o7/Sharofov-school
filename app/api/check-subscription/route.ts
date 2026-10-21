import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getMembership } from '@/lib/telegram';
import { getTelegramSessionUserId } from '@/lib/session';
const schema = z.object({ userId:z.number().int().positive(), code:z.string().min(1).max(80) });
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error:'So‘rov ma’lumotlari noto‘g‘ri.' }, { status:400 });
    const cookieId = await getTelegramSessionUserId();
    if (!cookieId || cookieId !== parsed.data.userId) return NextResponse.json({ error:'Telegram akkauntingizni avval tasdiqlang.' }, { status:401 });
    const isMember = await getMembership(parsed.data.userId);
    const client = db();
    const { data: referral } = await client.from('referrals').select('id').eq('code', parsed.data.code).eq('is_active',true).maybeSingle();
    await client.from('subscription_checks').insert({ telegram_user_id:parsed.data.userId, referral_id:referral?.id ?? null, referral_code:parsed.data.code, is_member:isMember });
    if (isMember) await client.from('participants').upsert({ telegram_user_id:parsed.data.userId, referral_id:referral?.id ?? null, referral_code:parsed.data.code, is_subscribed:true, last_checked_at:new Date().toISOString() }, { onConflict:'telegram_user_id' });
    return NextResponse.json({ ok:true, isMember });
  } catch (e) { return NextResponse.json({ error:e instanceof Error ? e.message : 'Obunani tekshirishda xatolik.' }, { status:500 }); }
}
