import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
  }

  try {
    const client = db();
    const { data, error } = await client
      .from('scan_events')
      .select('id, referral_code, user_agent, created_at')
      .eq('event_type', 'friend_lead')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const leads = (data || []).map((row) => {
      let parsed: Record<string, any> = {};
      try {
        parsed = JSON.parse(row.user_agent || '{}');
      } catch {
        parsed = { raw: row.user_agent };
      }

      return {
        id: row.id,
        created_at: row.created_at,
        referral_code: row.referral_code,
        referrer_name: parsed.referrer_name || 'Noma‘lum',
        referrer_phone: parsed.referrer_phone || '—',
        friend_name: parsed.friend_name || '—',
        friend_phone: parsed.friend_phone || '—',
        course_name: parsed.course_name || 'Aniqlanmagan',
        payment_status: parsed.payment_status || 'pending', // 'pending' | 'verified' | 'rejected'
        reward_status: parsed.reward_status || 'pending',   // 'pending' | 'paid' | 'rejected'
        reward_amount: parsed.reward_amount || 50000,
        notes: parsed.notes || '',
        verified_at: parsed.verified_at || null,
        paid_at: parsed.paid_at || null,
      };
    });

    return NextResponse.json({ leads });
  } catch (e) {
    console.error('Failed to get leads:', e);
    return NextResponse.json({ error: 'Ma’lumotlarni yuklab bo‘lmadi' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, payment_status, reward_status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID talab qilinadi' }, { status: 400 });
    }

    const client = db();
    const { data: existing, error: fetchErr } = await client
      .from('scan_events')
      .select('user_agent')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(existing.user_agent || '{}');
    } catch {
      parsed = {};
    }

    if (payment_status !== undefined) {
      parsed.payment_status = payment_status;
      if (payment_status === 'verified' && !parsed.verified_at) {
        parsed.verified_at = new Date().toISOString();
      }
    }
    if (reward_status !== undefined) {
      parsed.reward_status = reward_status;
      if (reward_status === 'paid' && !parsed.paid_at) {
        parsed.paid_at = new Date().toISOString();
      }
    }
    if (notes !== undefined) {
      parsed.notes = notes;
    }

    const { error: updateErr } = await client
      .from('scan_events')
      .update({ user_agent: JSON.stringify(parsed) })
      .eq('id', id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true, lead: { id, ...parsed } });
  } catch (e) {
    console.error('Failed to update lead:', e);
    return NextResponse.json({ error: 'O‘zgartirishda xatolik' }, { status: 500 });
  }
}
