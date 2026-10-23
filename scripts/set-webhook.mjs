#!/usr/bin/env node

/**
 * Sharofov School — Telegram Bot Webhook Sozlovchi Skript
 * 
 * Ushbu skript botni Vercel serverless platformasida 24/7 ishlab turishi uchun
 * Telegram Webhook URL manzilini sozlash yoki o'chirishga xizmat qiladi.
 * 
 * Foydalanish:
 *   node scripts/set-webhook.mjs https://loyihangiz.vercel.app
 *   yoki: npm run set-webhook https://loyihangiz.vercel.app
 * 
 * Webhookni o'chirish (lokal bot-worker bilan ishlash uchun):
 *   node scripts/set-webhook.mjs --delete
 */

const token = process.env.TELEGRAM_BOT_TOKEN || '8881510277:AAHuYVBdQzI3Mf_24-hpG6W2oP7y5UcIsyo';

async function main() {
  const args = process.argv.slice(2);
  const isDelete = args.includes('--delete') || args.includes('-d');
  let targetUrl = args.find((a) => !a.startsWith('-'));

  console.log('=====================================================');
  console.log('🤖 Sharofov School — Telegram Bot Webhook Boshqaruvi');
  console.log('=====================================================\n');

  try {
    // Joriy holatni tekshirish
    const [botInfoRes, webhookInfoRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json()),
      fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) => r.json()),
    ]);

    const botName = botInfoRes?.result?.first_name || 'Nomaʼlum';
    const botUsername = botInfoRes?.result?.username ? `@${botInfoRes.result.username}` : 'Nomaʼlum';
    const currentUrl = webhookInfoRes?.result?.url || '';
    const pendingUpdates = webhookInfoRes?.result?.pending_update_count ?? 0;

    console.log(`📌 Bot nomi:        ${botName}`);
    console.log(`📌 Bot username:    ${botUsername}`);
    console.log(`📌 Webhook holati:  ${currentUrl ? '✅ FAOL (' + currentUrl + ')' : '❌ O‘rnatilmagan (bo‘sh)'}`);
    console.log(`📌 Kutayotgan navbat: ${pendingUpdates} ta xabar\n`);

    if (isDelete) {
      console.log('🗑 Webhook o‘chirilmoqda...');
      const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`).then((r) => r.json());
      if (delRes.ok) {
        console.log('✅ Webhook muvaffaqiyatli o‘chirildi!');
        console.log('💡 Endi lokal kompyuterda `npm run bot` orqali ishlashingiz mumkin.\n');
      } else {
        console.error('❌ Xatolik yuz berdi:', delRes);
      }
      return;
    }

    if (!targetUrl) {
      console.log('💡 FOYDALANISH YO‘RIQNOMASI:');
      console.log('  1. Vercel deployment manzilingizni kiriting:');
      console.log('     node scripts/set-webhook.mjs https://sharofov-school.vercel.app\n');
      console.log('  2. Yoki brauzerda quyidagi manzilni oching:');
      console.log('     https://sharofov-school.vercel.app/api/telegram-webhook\n');
      console.log('  3. Webhookni bekor qilish (lokal polling uchun):');
      console.log('     node scripts/set-webhook.mjs --delete\n');
      return;
    }

    // URL formatlash
    targetUrl = targetUrl.trim().replace(/\/+$/, '');
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    if (!targetUrl.endsWith('/api/telegram-webhook')) {
      targetUrl += '/api/telegram-webhook';
    }

    console.log(`🚀 Telegramga yangi Webhook yuborilmoqda:`);
    console.log(`   🔗 ${targetUrl}\n`);

    const setRes = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(targetUrl)}&drop_pending_updates=true`
    ).then((r) => r.json());

    if (setRes.ok) {
      console.log('🎉 TABRIKLAYMIZ! Webhook muvaffaqiyatli sozlandi!');
      console.log('⚡ Telegram botingiz Vercel orqali 24/7 uzluksiz ishlamoqda.');
      console.log('Foydalanuvchilar Telegramda botga yozganda Vercel soniya ichida javob beradi.\n');
    } else {
      console.error('❌ Telegram javob qaytardi:', setRes);
    }
  } catch (error) {
    console.error('❌ Skriptda xatolik:', error.message || error);
  }
}

main();
