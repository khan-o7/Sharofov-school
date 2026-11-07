import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendTelegramLog, sendTelegramError } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const trackSchema = z.object({
  code: z.string().min(1).default('main'),
  eventType: z.enum(['landing_open', 'channel_click', 'referral_share', 'friend_lead', 'manual_subscribe']),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Noto‘g‘ri ma’lumot formati' }, { status: 400 });
    }

    const { code, eventType, metadata } = parsed.data;
    const userAgentHeader = req.headers.get('user-agent') || '';
    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(userAgentHeader);
    const device = isMobile ? '📱 Telefon (Mobile)' : '💻 Kompyuter (PC)';

    // Send Telegram notifications for main actions
    if (eventType === 'landing_open') {
      void sendTelegramLog(
        `📱 <b>Yangi QR Kod Skaneri!</b>\n\n` +
        `🏷 <b>Referal:</b> <code>${code}</code>\n` +
        `🌐 <b>Qurilma:</b> ${device}\n` +
        `⏰ <b>Vaqt:</b> ${now}`
      );
    } else if (eventType === 'channel_click') {
      void sendTelegramLog(
        `✈️ <b>Telegram Kanalga O‘tildi!</b>\n\n` +
        `👤 Foydalanuvchi @sharofovschool obuna tugmasini bosdi.\n` +
        `⏰ <b>Vaqt:</b> ${now}`
      );
    } else if (eventType === 'friend_lead' && metadata) {
      void sendTelegramLog(
        `🎁 <b>Yangi Do‘st Taklif Qilindi (Referal)!</b>\n\n` +
        `👤 <b>Taklif etuvchi:</b> ${metadata.referrer_name || '—'} (${metadata.referrer_phone || '—'})\n` +
        `🤝 <b>Do‘st:</b> ${metadata.friend_name || '—'} (${metadata.friend_phone || '—'})\n` +
        `📚 <b>Kurs:</b> ${metadata.course_name || 'Aniqlanmagan'}\n` +
        `💰 <b>Kutilayotgan mukofot:</b> 50 000 so‘m\n` +
        `⏰ <b>Vaqt:</b> ${now}`
      );
    } else if (eventType === 'manual_subscribe' && metadata?.telegramUsername) {
      void sendTelegramLog(
        `✅ <b>Obuna Qayd Etildi!</b>\n\n` +
        `👤 <b>Username:</b> @${metadata.telegramUsername}\n` +
        `⏰ <b>Vaqt:</b> ${now}`
      );
    }

    let insertedId: string | undefined = undefined;

    // Database record attempt (if Supabase configured)
    try {
      const client = db();

      // Find referral if exists
      const { data: referral } = await client
        .from('referrals')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      // Package payload
      const payload = {
        referral_code: code,
        referral_id: referral?.id || null,
        event_type: eventType,
        user_agent: metadata ? JSON.stringify({ ...metadata, ua: userAgentHeader.slice(0, 120) }) : userAgentHeader.slice(0, 300),
      };

      const { error, data } = await client.from('scan_events').insert(payload).select().single();
      if (error) {
        console.error('Track event insert error:', error);
        void sendTelegramError('Supabase: scan_events insert', error, { code, eventType });
      } else {
        insertedId = data?.id;
      }

      // If it's a manual subscription confirmation, also record or update in participants table if possible
      if (eventType === 'manual_subscribe' && metadata?.telegramUsername) {
        try {
          const numericId = Number(metadata.telegramUserId) || Math.floor(100000000 + Math.random() * 900000000);
          await client.from('participants').upsert(
            {
              telegram_user_id: numericId,
              referral_id: referral?.id || null,
              referral_code: code,
              is_subscribed: true,
              last_checked_at: new Date().toISOString(),
            },
            { onConflict: 'telegram_user_id' }
          );
        } catch (e) {
          console.warn('Could not record participant row:', e);
          void sendTelegramError('Supabase: participants upsert', e, { code, metadata });
        }
      }
    } catch (dbErr) {
      // If DB is offline or not configured in dev, we already sent the Telegram alert and logged
      console.warn('Database logging skipped (DB not configured or offline):', dbErr);
    }

    return NextResponse.json({ ok: true, id: insertedId });
  } catch (e) {
    console.error('Track error:', e);
    void sendTelegramError('API: /api/track', e);
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 });
  }
}
