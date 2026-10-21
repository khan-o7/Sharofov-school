import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/session';
import { getChannelMemberCount } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function tashkentDayKey(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q.' }, { status: 401 });
  try {
    const client = db();
    const now = new Date();
    const local = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const start = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 5 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000);
    const [totalScans, todayScans, participants, latestScans, recentEvents, channelMembersResult] = await Promise.all([
      client.from('scan_events').select('id', { count: 'exact', head: true }),
      client.from('scan_events').select('id', { count: 'exact', head: true }).gte('created_at', start.toISOString()),
      client.from('participants').select('telegram_user_id', { count: 'exact', head: true }).eq('is_subscribed', true),
      client.from('scan_events').select('id,created_at,referral_code,event_type').order('created_at', { ascending: false }).limit(50),
      client.from('scan_events').select('created_at').gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: true }).limit(10000),
      getChannelMemberCount().then(count => ({ count, error: null as string | null })).catch(e => ({ count: null, error: e instanceof Error ? e.message : 'Telegram API xatosi' })),
    ]);
    const counts = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(start.getTime() - i * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000);
      const key = tashkentDayKey(date.toISOString());
      counts.set(key, 0);
    }
    for (const event of recentEvents.data ?? []) {
      const key = tashkentDayKey(event.created_at);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return NextResponse.json({
      totalScans: totalScans.count ?? 0,
      todayScans: todayScans.count ?? 0,
      subscribedUsers: participants.count ?? 0,
      channelMembers: channelMembersResult.count,
      channelStatsError: channelMembersResult.error,
      dailyScans: Array.from(counts.entries()).map(([date, scans]) => ({ date, scans })),
      latestScans: latestScans.data ?? [],
      dataWarnings: [totalScans.error, todayScans.error, participants.error, latestScans.error, recentEvents.error].filter(Boolean).map(e => e?.message),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Statistikani olishda xatolik.' }, { status: 500 });
  }
}
