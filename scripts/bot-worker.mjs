import fetch from 'node:child_process'; // we can use global fetch in Node 18+

const token = process.env.TELEGRAM_BOT_TOKEN || '8881510277:AAHuYVBdQzI3Mf_24-hpG6W2oP7y5UcIsyo';
const adminLogChatId = process.env.TELEGRAM_LOG_CHAT_ID || '8430883731';

console.log('🤖 Sharofov School Telegram Bot worker ishga tushdi...');

let offset = 0;

async function sendMessage(chatId, text, replyMarkup) {
  try {
    const res = await globalThis.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('sendMessage xatosi:', err.message);
  }
}

async function processUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();
  const from = message.from || {};
  const userName = from.first_name || 'Foydalanuvchi';
  const usernameTag = from.username ? `@${from.username}` : `ID: ${from.id}`;

  console.log(`📩 Xabar keldi: [${usernameTag}] -> "${text}"`);

  if (text.startsWith('/start') || text === 'start' || text === 'Salom') {
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

    await sendMessage(chatId, replyText, inlineKeyboard);

    // Notify @uzb_c0de
    if (chatId !== Number(adminLogChatId)) {
      const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
      const notifyAdminText = 
        `👤 <b>Yangi Foydalanuvchi Botga Start Bosdi!</b>\n\n` +
        `👤 <b>Ism:</b> ${userName}\n` +
        `🏷 <b>Username:</b> ${from.username ? '@' + from.username : 'Mavjud emas'}\n` +
        `🆔 <b>Telegram ID:</b> <code>${from.id}</code>\n` +
        `⏰ <b>Vaqt:</b> ${now}`;

      await sendMessage(adminLogChatId, notifyAdminText);
    }
  } else {
    // For other messages, give guidance
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
    await sendMessage(chatId, replyText, inlineKeyboard);
  }
}

async function poll() {
  while (true) {
    try {
      const res = await globalThis.fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=25`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await processUpdate(update);
        }
      } else {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error('Polling xatosi:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

poll();
