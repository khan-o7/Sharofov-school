import crypto from 'node:crypto';

export type TelegramUser = { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string; auth_date: number; hash: string };
export function verifyTelegramLogin(data: TelegramUser) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL_ID;
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !channel) throw new Error('Telegram bot yoki kanal ID sozlanmagan.');
  const response = await fetch(`https://api.telegram.org/bot${token}/getChatMemberCount`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: channel }), cache: 'no-store',
  });
  const json = await response.json();
  if (!response.ok || !json.ok) throw new Error(json.description || 'Kanal a’zolari sonini olib bo‘lmadi.');
  return Number(json.result ?? 0);
}
