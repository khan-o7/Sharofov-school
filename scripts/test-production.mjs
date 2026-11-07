async function runTests() {
  console.log('--- STARTING INTEGRATION TESTS ---');

  // 1. Test GET /
  console.log('\n1. Testing GET / (Main Website with Modal)...');
  const resHome = await fetch('http://localhost:3005/');
  console.log('Status:', resHome.status);
  const homeHtml = await resHome.text();
  
  const requiredChecks = [
    { label: 'Wing Brand Logo', check: homeHtml.includes('wing') },
    { label: 'SHAROFOV SCHOOL Title', check: homeHtml.includes('SHAROFOV') },
    { label: 'Hero Students Image', check: homeHtml.includes('/assets/hero-students.jpg') },
    { label: 'Banner Students Image', check: homeHtml.includes('/assets/banner-students.jpg') },
    { label: 'About Section', check: homeHtml.includes('Bilimga ishonch bilan qadam') },
    { label: 'Stats Section (1000+)', check: homeHtml.includes('1000+') },
    { label: 'Advantages (Co-working)', check: homeHtml.includes('Co-working zonasi') },
    { label: 'Books (/assets/kitoblar.jpeg)', check: homeHtml.includes('/assets/kitoblar.jpeg') },
    { label: 'Certificate (/assets/sertifikat.jpeg)', check: homeHtml.includes('/assets/sertifikat.jpeg') },
    { label: 'Reviews Section', check: homeHtml.includes('O‘quvchilar va ota-onalar fikrlari') },
    { label: 'Contact Section (+998 33 999-43-43)', check: homeHtml.includes('33 999-43-43') },
    { label: 'School Modal Overlay', check: homeHtml.includes('modal-overlay') },
    { label: 'Modal 50 000 so‘m headline', check: homeHtml.includes('50&nbsp;000&nbsp;so‘m') || homeHtml.includes('50 000') },
    { label: 'Modal Launcher Pill', check: homeHtml.includes('promo-launcher-pill') },
  ];

  let passed = true;
  for (const c of requiredChecks) {
    if (c.check) {
      console.log(`  [PASS] ${c.label}`);
    } else {
      console.error(`  [FAIL] ${c.label}`);
      passed = false;
    }
  }

  // 2. Test GET /r/main
  console.log('\n2. Testing GET /r/main (QR code entry)...');
  const resReferral = await fetch('http://localhost:3005/r/main');
  console.log('Status:', resReferral.status);
  if (resReferral.status === 200) {
    console.log('  [PASS] /r/main loads successfully with status 200');
  } else {
    console.error('  [FAIL] /r/main status:', resReferral.status);
  }

  // 3. Test POST /api/track
  console.log('\n3. Testing POST /api/track (Action Tracking)...');
  const resTrack = await fetch('http://localhost:3005/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'main',
      eventType: 'channel_click',
      metadata: { source: 'test-suite' },
    }),
  });
  console.log('/api/track channel_click status:', resTrack.status);
  const trackJson = await resTrack.json();
  console.log('/api/track response:', trackJson);

  // 4. Test GET /admin
  console.log('\n4. Testing GET /admin (Admin Dashboard)...');
  const resAdmin = await fetch('http://localhost:3005/admin');
  console.log('Status:', resAdmin.status);
  const adminHtml = await resAdmin.text();
  console.log('Admin login form exists:', adminHtml.includes('Parol') || adminHtml.includes('SHAROFOV'));

  // 5. Test Telegram Webhook GET and POST
  console.log('\n5. Testing Telegram Webhook...');
  const resWebhookGet = await fetch('http://localhost:3005/api/telegram-webhook');
  console.log('GET /api/telegram-webhook status:', resWebhookGet.status);

  const resWebhookPost = await fetch('http://localhost:3005/api/telegram-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 999999,
      message: {
        message_id: 1,
        chat: { id: 8430883731, type: 'private' },
        from: { id: 8430883731, first_name: 'TestBotRunner' },
        text: '/start',
      },
    }),
  });
  console.log('POST /api/telegram-webhook status:', resWebhookPost.status);
  const webhookJson = await resWebhookPost.json();
  console.log('POST /api/telegram-webhook response:', webhookJson);

  console.log('\n--- ALL INTEGRATION TESTS COMPLETED ---');
}

runTests().catch(console.error);

