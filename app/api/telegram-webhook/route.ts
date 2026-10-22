import { NextResponse } from 'next/server';
import { sendTelegramLog } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminLogChatId = process.env.TELEGRAM_LOG_CHAT_ID || '8430883731';

    const message = update?.message;
    if (!message || !message.text || !token) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const from = message.from || {};
    const userName = from.first_name || 'Foydalanuvchi';

    if (text.startsWith('/start') || text === 'start' || text.toLowerCase() === 'salom') {
      const replyText = `Salom Xush kelibsiz! Administrator bilan bog'lanish uchun @sharofov_school ga murojaat eting.`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: '📞 Administrator bilan bog‘lanish',
              url: 'https://t.me/sharofov_school',
            },
          ],
          [
            {
              text: '📢 Rasmiy Kanalimiz',
              url: 'https://t.me/sharofovschool',
            },
          ],
        ],
      };

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        }),
      });

      // Notify @uzb_c0de
      if (chatId !== Number(adminLogChatId)) {
        const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
        const notifyAdminText =
          `👤 <b>Yangi Foydalanuvchi Botga Start Bosdi!</b>\n\n` +
          `👤 <b>Ism:</b> ${userName}\n` +
          `🏷 <b>Username:</b> ${from.username ? '@' + from.username : 'Mavjud emas'}\n` +
          `🆔 <b>Telegram ID:</b> <code>${from.id}</code>\n` +
          `⏰ <b>Vaqt:</b> ${now}`;

        void sendTelegramLog(notifyAdminText);
      }
    } else {
      const replyText = `Administrator bilan bog'lanish uchun @sharofov_school ga murojaat eting.`;
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: '📞 Administrator bilan bog‘lanish',
              url: 'https://t.me/sharofov_school',
            },
          ],
        ],
      };

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
