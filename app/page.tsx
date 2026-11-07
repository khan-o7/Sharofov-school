import { headers } from 'next/headers';
import { db } from '@/lib/db';
import MainWebsite from '@/components/MainWebsite';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const code = 'main';
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

    // Log the landing open event
    await client.from('scan_events').insert({
      referral_code: code,
      referral_id: referralId,
      event_type: 'landing_open',
      user_agent: userAgent.slice(0, 300),
    });
  } catch (e) {
    // If Supabase is not configured yet or during build, fail silently
    console.warn('Home scan logging note:', e);
  }

  return <MainWebsite referralCode={code} initialModalOpen={true} />;
}
