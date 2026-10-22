import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/session';
import { getChannelMemberCount, sendTelegramError } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function getTashkentDate(date: Date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5 * 3600000);
}

function formatDayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Ruxsat yo‘q.' }, { status: 401 });
  }

  try {
    const client = db();
    const now = new Date();
    const nowTashkent = getTashkentDate(now);

    // Start of Today (Tashkent 00:00:00) converted to UTC
    const startOfTodayTashkent = new Date(nowTashkent.getFullYear(), nowTashkent.getMonth(), nowTashkent.getDate());
    const startOfTodayUtc = new Date(startOfTodayTashkent.getTime() - 5 * 3600000);

    // Start of This Month (Tashkent 1st 00:00:00) converted to UTC
    const startOfMonthTashkent = new Date(nowTashkent.getFullYear(), nowTashkent.getMonth(), 1);
    const startOfMonthUtc = new Date(startOfMonthTashkent.getTime() - 5 * 3600000);

    // Start of This Year (Tashkent Jan 1 00:00:00) converted to UTC
    const startOfYearTashkent = new Date(nowTashkent.getFullYear(), 0, 1);
    const startOfYearUtc = new Date(startOfYearTashkent.getTime() - 5 * 3600000);

    // 30 Days ago
    const thirtyDaysAgoUtc = new Date(startOfTodayUtc.getTime() - 29 * 24 * 3600000);

    // Parallel fetch counts & events
    const [
      totalScansRes,
      todayScansRes,
      monthScansRes,
      yearScansRes,
      participantsRes,
      todaySubscribedRes,
      monthSubscribedRes,
      channelClicksTotalRes,
      channelClicksTodayRes,
      channelClicksMonthRes,
      allEventsRes,
      latestScansRes,
      channelMembersResult,
    ] = await Promise.all([
      // Total Scans
      client.from('scan_events').select('id', { count: 'exact', head: true }),
      // Today Scans
      client.from('scan_events').select('id', { count: 'exact', head: true }).gte('created_at', startOfTodayUtc.toISOString()),
      // Month Scans
      client.from('scan_events').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonthUtc.toISOString()),
      // Year Scans
      client.from('scan_events').select('id', { count: 'exact', head: true }).gte('created_at', startOfYearUtc.toISOString()),
      // Confirmed Subscribers
      client.from('participants').select('telegram_user_id', { count: 'exact', head: true }).eq('is_subscribed', true),
      // Subscribed today
      client.from('participants').select('telegram_user_id', { count: 'exact', head: true }).eq('is_subscribed', true).gte('created_at', startOfTodayUtc.toISOString()),
      // Subscribed this month
      client.from('participants').select('telegram_user_id', { count: 'exact', head: true }).eq('is_subscribed', true).gte('created_at', startOfMonthUtc.toISOString()),
      // Channel clicks total
      client.from('scan_events').select('id', { count: 'exact', head: true }).eq('event_type', 'channel_click'),
      // Channel clicks today
      client.from('scan_events').select('id', { count: 'exact', head: true }).eq('event_type', 'channel_click').gte('created_at', startOfTodayUtc.toISOString()),
      // Channel clicks month
      client.from('scan_events').select('id', { count: 'exact', head: true }).eq('event_type', 'channel_click').gte('created_at', startOfMonthUtc.toISOString()),
      // Events for charts (last 365 days, up to 50000 rows)
      client.from('scan_events').select('id, created_at, event_type, user_agent, referral_code').gte('created_at', startOfYearUtc.toISOString()).order('created_at', { ascending: true }).limit(50000),
      // Latest 50 events
      client.from('scan_events').select('id, created_at, referral_code, event_type, user_agent').order('created_at', { ascending: false }).limit(50),
      // Telegram Live member count
      getChannelMemberCount()
        .then((count) => ({ count, error: null as string | null }))
        .catch((e) => ({ count: null, error: e instanceof Error ? e.message : 'Telegram API xatosi' })),
    ]);

    const events = allEventsRes.data || [];

    // 1. HOURLY BREAKDOWN FOR TODAY (00:00 to 23:00)
    const hourlyScans: { hour: string; label: string; scans: number; joins: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const label = `${String(h).padStart(2, '0')}:00`;
      hourlyScans.push({ hour: String(h), label, scans: 0, joins: 0 });
    }

    // 2. DAILY BREAKDOWN (Last 30 days)
    const dailyMap = new Map<string, { date: string; label: string; scans: number; joins: number; leads: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(startOfTodayTashkent.getTime() - i * 24 * 3600000);
      const key = formatDayKey(d);
      const dayNum = d.getDate();
      const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
      const label = `${dayNum}-${monthNames[d.getMonth()]}`;
      dailyMap.set(key, { date: key, label, scans: 0, joins: 0, leads: 0 });
    }

    // 3. MONTHLY BREAKDOWN FOR CURRENT YEAR (12 Months)
    const monthlyMap = new Map<number, { month: number; label: string; scans: number; joins: number; leads: number }>();
    const fullMonthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    for (let m = 0; m < 12; m++) {
      monthlyMap.set(m, { month: m + 1, label: fullMonthNames[m], scans: 0, joins: 0, leads: 0 });
    }

    // Tally Leads and metrics
    let totalLeadsCount = 0;
    let todayLeadsCount = 0;
    let monthLeadsCount = 0;
    let verifiedPaymentsCount = 0;
    let paidRewardsCount = 0;

    for (const ev of events) {
      const evTashkent = getTashkentDate(new Date(ev.created_at));
      const evDayKey = formatDayKey(evTashkent);
      const evMonth = evTashkent.getMonth();
      const isToday = evDayKey === formatDayKey(nowTashkent);
      const isThisMonth = evTashkent.getFullYear() === nowTashkent.getFullYear() && evMonth === nowTashkent.getMonth();

      // Count scan event
      if (ev.event_type === 'landing_open') {
        if (isToday) {
          const hour = evTashkent.getHours();
          if (hourlyScans[hour]) hourlyScans[hour].scans++;
        }
        if (dailyMap.has(evDayKey)) {
          dailyMap.get(evDayKey)!.scans++;
        }
        if (monthlyMap.has(evMonth)) {
          monthlyMap.get(evMonth)!.scans++;
        }
      }

      // Count channel clicks & subscription events
      if (ev.event_type === 'channel_click' || ev.event_type === 'subscription_verified' || ev.event_type === 'manual_subscribe') {
        if (isToday) {
          const hour = evTashkent.getHours();
          if (hourlyScans[hour]) hourlyScans[hour].joins++;
        }
        if (dailyMap.has(evDayKey)) {
          dailyMap.get(evDayKey)!.joins++;
        }
        if (monthlyMap.has(evMonth)) {
          monthlyMap.get(evMonth)!.joins++;
        }
      }

      // Count friend leads
      if (ev.event_type === 'friend_lead') {
        totalLeadsCount++;
        if (isToday) todayLeadsCount++;
        if (isThisMonth) monthLeadsCount++;

        if (dailyMap.has(evDayKey)) {
          dailyMap.get(evDayKey)!.leads++;
        }
        if (monthlyMap.has(evMonth)) {
          monthlyMap.get(evMonth)!.leads++;
        }

        try {
          const parsed = JSON.parse(ev.user_agent || '{}');
          if (parsed.payment_status === 'verified') verifiedPaymentsCount++;
          if (parsed.reward_status === 'paid') paidRewardsCount++;
        } catch {
          // ignore parse error
        }
      }
    }

    const totalScans = totalScansRes.count ?? 0;
    const todayScans = todayScansRes.count ?? 0;
    const monthScans = monthScansRes.count ?? 0;
    const yearScans = yearScansRes.count ?? 0;

    const channelMembers = channelMembersResult.count;
    const channelClicksTotal = channelClicksTotalRes.count ?? 0;
    const channelClicksToday = channelClicksTodayRes.count ?? 0;
    const channelClicksMonth = channelClicksMonthRes.count ?? 0;

    const subscribedUsers = participantsRes.count ?? 0;
    const todaySubscribed = todaySubscribedRes.count ?? 0;
    const monthSubscribed = monthSubscribedRes.count ?? 0;

    // Conversion rate: (channel clicks / total scans)
    const conversionRate = totalScans > 0 ? Math.round((channelClicksTotal / totalScans) * 100) : 0;

    return NextResponse.json({
      // Summary Metrics
      scans: {
        total: totalScans,
        today: todayScans,
        month: monthScans,
        year: yearScans,
      },
      channel: {
        totalMembers: channelMembers,
        error: channelMembersResult.error,
        clicksTotal: channelClicksTotal,
        clicksToday: channelClicksToday,
        clicksMonth: channelClicksMonth,
        subscribedTotal: subscribedUsers,
        subscribedToday: todaySubscribed,
        subscribedMonth: monthSubscribed,
        conversionRate,
      },
      leads: {
        total: totalLeadsCount,
        today: todayLeadsCount,
        month: monthLeadsCount,
        verifiedPayments: verifiedPaymentsCount,
        paidRewards: paidRewardsCount,
        totalRewardAmount: paidRewardsCount * 50000,
        pendingRewardAmount: verifiedPaymentsCount > paidRewardsCount ? (verifiedPaymentsCount - paidRewardsCount) * 50000 : 0,
      },
      // Filter Chart Data Series
      charts: {
        hourly: hourlyScans,
        daily: Array.from(dailyMap.values()),
        monthly: Array.from(monthlyMap.values()),
      },
      latestScans: latestScansRes.data ?? [],
    });
  } catch (e) {
    console.error('Stats error:', e);
    void sendTelegramError('API: /api/admin/stats', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Statistikani olishda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
