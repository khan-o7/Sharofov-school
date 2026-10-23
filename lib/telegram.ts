import crypto from 'node:crypto';

const DEFAULT_BOT_TOKEN = '8881510277:AAHuYVBdQzI3Mf_24-hpG6W2oP7y5UcIsyo';
const DEFAULT_CHANNEL_ID = '@sharofovschool';
const DEFAULT_LOG_CHAT_ID = '8430883731';

export type TelegramUser = { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string; auth_date: number; hash: string };
export function verifyTelegramLogin(data: TelegramUser) {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan.');
  const entries = Object.entries(data).filter(([key, value]) => key !== 'hash' && value !== undefined && value !== null).map(([key, value]) => `${key}=${value}`).sort();
  const checkString = entries.join('\n');
  const secretKey = crypto.createHash('sha256').update(token).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  const a = Buffer.from(expected, 'hex'); const b = Buffer.from(data.hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  // Reject old login assertions to limit replay risk.
  return Math.abs(Math.floor(Date.now() / 1000) - Number(data.auth_date)) <= 300;
}
export async function getMembership(userId: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  if (!token || !channel) throw new Error('Telegram bot yoki kanal ID sozlanmagan.');
  const response = await fetch(`https://api.telegram.org/bot${token}/getChatMember`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: channel, user_id: userId }), cache: 'no-store',
  });
  const json = await response.json();
  if (!response.ok || !json.ok) throw new Error(json.description || 'Telegram obunasini tekshirib bo‘lmadi.');
  const status = json.result?.status;
  return ['creator', 'administrator', 'member'].includes(status) || (status === 'restricted' && json.result?.is_member === true);
}

export async function getChannelMemberCount() {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  if (!token || !channel) throw new Error('Telegram bot yoki kanal ID sozlanmagan.');
  const response = await fetch(`https://api.telegram.org/bot${token}/getChatMemberCount`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: channel }), cache: 'no-store',
  });
  const json = await response.json();
  if (!response.ok || !json.ok) throw new Error(json.description || 'Kanal a’zolari sonini olib bo‘lmadi.');
  return Number(json.result ?? 0);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Xabarlar va hodisalar logini @uzb_c0de ga yuborish
 */
export async function sendTelegramLog(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_LOG_CHAT_ID || DEFAULT_LOG_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const text = message.length > 4000 ? message.slice(0, 3990) + '…' : message;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      cache: 'no-store',
    });
  } catch (err) {
    console.error('sendTelegramLog failed:', err);
  }
}

/**
 * Tizimda yuzaga kelgan xatoliklarni @uzb_c0de ga yuborish
 */
export async function sendTelegramError(title: string, error: unknown, context?: Record<string, unknown>) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error && error.stack ? error.stack.slice(0, 400) : '';
  const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

  let text = `🚨 <b>TIZIMDA XATOLIK!</b>\n\n`;
  text += `📌 <b>Bo‘lim / Manzil:</b> ${title}\n`;
  text += `⏰ <b>Vaqt:</b> ${now}\n`;
  text += `❌ <b>Xatolik:</b> <code>${escapeHtml(errorMsg)}</code>\n`;
  if (context && Object.keys(context).length > 0) {
    text += `📋 <b>Kontekst:</b> <pre>${escapeHtml(JSON.stringify(context, null, 2).slice(0, 350))}</pre>\n`;
  }
  if (stack) {
    text += `\n🔍 <b>Stack:</b>\n<pre>${escapeHtml(stack)}</pre>`;
  }

  await sendTelegramLog(text);
}
