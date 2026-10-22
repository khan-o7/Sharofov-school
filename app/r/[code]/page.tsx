import { headers } from 'next/headers';
import { db } from '@/lib/db';
import ReferralClient from './referral-client';

export const dynamic = 'force-dynamic';

export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let referralId: string | null = null;

  try {
    const client = db();
    const { data: referral } = await client
      .from('referrals')
      .select('id, code, owner_name, is_active')
      .eq('code', code)
      .maybeSingle();

    if (referral?.is_active) {
      referralId = referral.id;
    }

    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || 'Unknown Browser';

    // Log the scan event
    await client.from('scan_events').insert({
      referral_code: code,
      referral_id: referralId,
      event_type: 'landing_open',
      user_agent: userAgent.slice(0, 300),
    });
  } catch (e) {
    console.error('Scan logging failed:', e);
  }

  return <ReferralClient code={code} referralId={referralId} />;
}
