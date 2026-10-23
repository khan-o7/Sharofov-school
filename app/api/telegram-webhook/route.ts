import { NextResponse } from 'next/server';
import { sendTelegramLog } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8881510277:AAHuYVBdQzI3Mf_24-hpG6W2oP7y5UcIsyo';
const ADMIN_LOG_CHAT_ID = process.env.TELEGRAM_LOG_CHAT_ID || '8430883731';

/**
 * TELEGRAM WEBHOOK POST HANDLER
 * Telegram serverlari foydalanuvchilar xabar yozganda ushbu manzilga avtomatik POST so'rov yuboradi.
 */
export async function POST(req: Request) {
  try {
    const update = await req.json();

    const message = update?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const from = message.from || {};
    const userName = from.first_name || 'Foydalanuvchi';
    const isStart = text.startsWith('/start') || text === 'start' || text.toLowerCase() === 'salom';

    if (isStart) {
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

      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          }),
        });
      } catch (err) {
        console.error('Bot sendMessage error:', err);
      }

      // Adminga (@uzb_c0de) bildirishnoma yuborish
      if (chatId !== Number(ADMIN_LOG_CHAT_ID)) {
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

      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          }),
        });
      } catch (err) {
        console.error('Bot reply error:', err);
      }
    }

    // Telegramga har doim 200 OK qaytarish kerak, aks holda Telegram xabarni qayta-qayta yuboraveradi
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ ok: true, error: String(err) });
  }
}

/**
 * TELEGRAM WEBHOOK GET HANDLER
 * Brauzer orqali ochilganda holatni ko'rsatish va 1 bosishda Webhookni Vercel bilan ulash imkoniyati
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || (searchParams.has('set') ? 'set' : searchParams.has('delete') ? 'delete' : 'info');
  const customUrl = searchParams.get('url');

  // Sayt protokoli va domenini aniqlash
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const webhookUrl = customUrl || `${proto}://${host}/api/telegram-webhook`;

  let actionResult: Record<string, unknown> | null = null;

  if (action === 'set') {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`
      );
      actionResult = await res.json();
    } catch (e: unknown) {
      actionResult = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else if (action === 'delete') {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`
      );
      actionResult = await res.json();
    } catch (e: unknown) {
      actionResult = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Telegram bot va joriy webhook holatini olish
  let botInfo: { first_name?: string; username?: string } = {};
  let webhookInfo: { url?: string; pending_update_count?: number } = {};
  try {
    const [meRes, whRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`).then((r) => r.json()),
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`).then((r) => r.json()),
    ]);
    botInfo = meRes?.result || {};
    webhookInfo = whRes?.result || {};
  } catch {}

  const wantsJson = searchParams.get('format') === 'json' || req.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return NextResponse.json({
      action,
      actionResult,
      bot: botInfo,
      webhook: webhookInfo,
      detectedWebhookUrl: webhookUrl,
    });
  }

  const isWebhookActive = Boolean(webhookInfo.url);

  const html = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sharofov School — Telegram Bot & Webhook Boshqaruvi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0b101b; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #131b2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; max-width: 620px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
    .badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3); }
    .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); }
    .btn-secondary:hover { background: #334155; }
    .btn-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
    .label { color: #94a3b8; }
    .val { color: #f8fafc; font-weight: 600; text-align: right; word-break: break-all; }
    .alert { padding: 14px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; line-height: 1.5; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; }
    .alert-danger { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
    .alert-info { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 20px; font-weight: 700;">🤖 Telegram Bot & Webhook</h1>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Sharofov School Telegram Bot 24/7 holati</p>
      </div>
      <div>
        ${
          isWebhookActive
            ? '<span class="badge badge-success">● 24/7 Webhook Faol</span>'
            : '<span class="badge badge-warning">○ Webhook Ulanmagan</span>'
        }
      </div>
    </div>

    ${
      actionResult
        ? `<div class="alert ${actionResult.ok ? 'alert-success' : 'alert-danger'}">
            <strong>Natija:</strong> ${actionResult.ok ? 'Muvaffaqiyatli bajarildi! ✅' : 'Xatolik yuz berdi ❌'}
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">${JSON.stringify(actionResult)}</div>
          </div>`
        : ''
    }

    <div style="background: rgba(0,0,0,0.25); border-radius: 14px; padding: 16px; margin-bottom: 24px;">
      <div class="row">
        <span class="label">Bot nomi:</span>
        <span class="val">${botInfo.first_name || 'Nomaʼlum'}</span>
      </div>
      <div class="row">
        <span class="label">Bot Username:</span>
        <span class="val"><a href="https://t.me/${botInfo.username}" target="_blank" style="color: #38bdf8; text-decoration: none;">@${botInfo.username || 'sharofov_school_bot'}</a></span>
      </div>
      <div class="row">
        <span class="label">Joriy Webhook URL:</span>
        <span class="val" style="font-family: monospace; font-size: 12px;">${webhookInfo.url || 'O‘rnatilmagan (bo‘sh)'}</span>
      </div>
      <div class="row">
        <span class="label">Aniqlangan Webhook URL:</span>
        <span class="val" style="font-family: monospace; font-size: 12px; color: #fbbf24;">${webhookUrl}</span>
      </div>
      <div class="row" style="border-bottom: none;">
        <span class="label">Kutayotgan xabarlar soni:</span>
        <span class="val">${webhookInfo.pending_update_count ?? 0}</span>
      </div>
    </div>

    <div class="alert alert-info">
      💡 <b>Vercel va 24/7 ishlash qoidasi:</b><br/>
      Vercel serverless platforma bo‘lgani uchun fon rejimida uzluksiz jarayonlar (worker/loop) ishlamaydi. Bot 24/7 uzluksiz ishlab turishi uchun Telegram <b>Webhook</b> tizimidan foydalaniladi. Webhook o‘rnatilgach, har bir xabar Vercel API ga yuboriladi va bot soniya ichida javob beradi.
    </div>

    <div style="display: grid; gap: 10px;">
      <a href="?action=set" class="btn btn-primary">
        🚀 Webhookni Bir Bosishda O‘rnatish (24/7 Faollashtirish)
      </a>

      <div style="display: flex; gap: 10px; margin-top: 6px;">
        <a href="?action=info" class="btn btn-secondary" style="flex: 1;">
          🔄 Holatni Yangilash
        </a>
        <a href="?action=delete" class="btn btn-danger" style="flex: 1;">
          🗑 Webhookni O‘chirish
        </a>
      </div>
      <div style="text-align: center; margin-top: 10px;">
        <a href="/admin" style="font-size: 13px; color: #94a3b8; text-decoration: none;">⬅️ Admin Panelga Qaytish</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
