# Sharofov School — Rasmiy Ta’lim Platformasi & Mukofot Tizimi 🎓

Ushbu loyiha **Sharofov School** zamonaviy o‘quv markazi uchun maxsus ishlab chiqilgan premium darajadagi rasmiy veb-sayt, avtomatik ochiluvchi 50 000 so‘m aksiya/referal modal oynasi hamda to‘liq ma’muriy boshqaruv (Admin Dashboard) tizimidir.

Dizayn konsepsiyasi: **Premium Glassmorphism + Modern Education Platform + Minimalist UI**.

---

## 🌟 Loyiha Arxitekturasi va Imkoniyatlari

### 1. Asosiy Sharofov School Sayti
Dizayn chizmasiga (`Sharofov school 7.11.2026.html`) maksimal darajada aynan ishlab chiqilgan zamonaviy platforma:

- **Topbar (Header):**
  - Sharofov School qanot logotipi (`.wing`) va brend nomi.
  - Silliq navigatsiya: *Bosh sahifa, Biz haqimizda, Statistika, Afzalliklar, Kitoblar, Sertifikat, Fikrlar, Aloqa*.
  - Yuqori paneldagi **"🎁 Aksiya (50 000 so‘m)"** maxsus ochuvchi tugmasi.
  - Mobil qurilmalar uchun moslashuvchan ochiluvchi menyu.
- **Hero & Banner Visuals:**
  - `hero-students.jpg` va `banner-students.jpg` orqali ta’lim muhitining vizual taqdimoti.
- **Biz haqimizda (`#about`):**
  - "Bilimga ishonch bilan qadam" va `SHAROFOV SCHOOL — BILIM • RIVOJLANISH • KELAJAK` gradient emblemasi.
- **Statistika (`#stats`):**
  - 1000+ Bitiruvchilar, 95% O‘zlashtirgan o‘quvchilar, 97+ Imtihondan jamlagan ball.
- **Afzalliklarimiz (`#advantages`):**
  - Co-working zonasi, Qo‘shimcha o‘qituvchi, Oylik imtihonlar kartalari.
- **O‘quv materiallari (`#books`):**
  - Sharofov School maxsus o‘quv qo‘llanmalari (English, Русский язык, Arab tili, Pochemuchka).
- **Yutuqlar e’tirofi (`#certificate`):**
  - Kursni muvaffaqiyatli tamomlagan o‘quvchilar sertifikati namoyishi.
- **Fikrlar bo‘limi (`#reviews`):**
  - Interaktiv baholash va fikr yuborish formasi (1–5 yulduzli baholash, ism, rol, matn).
  - Yangi yuborilgan fikr jonli ravishda ro‘yxatga qo‘shiladi va adminga Telegram orqali xabar boradi.
- **Aloqa (`#contact`):**
  - Telefon: `+998 33 999-43-43`, Telegram: `@sharofov_school`, Instagram: `@sharofov_school`.
  - Manzil: *Toshkent shahri, Uchtepa tumani, Farhod bozori ro‘parasida, OAZIS binosi, 2-qavat*.
  - Google Xaritalar manzili va ish vaqtlari.
- **Floating Controls:**
  - Yuqoriga silliq qaytish (`To-Top`) tugmasi.
  - Pastki chap burchakda miltillovchi yashil indikatorli `ModalLauncher` tugmasi.

---

### 2. Avtomatik Ochiladigan Modal Oyna (Aksiya & Referal)
Foydalanuvchi asosiy saytga tashrif buyurishi bilan orqa fon qoraytirilgan va xiralashtirilgan (`backdrop-filter: blur(14px)`) holda ochiladi:

- **Bayramona Konfetti:** Ochilganda avtomatik ravishda oltin-binafsha konfetti animatsiyasi.
- **Sovg‘a qutisi vizuali:** 3D oltin sovg‘a qutisi va *"50 000 so‘m pul mukofoti Sizniki bo‘lishi mumkin!"* kafolat e’loni.
- **1-Shart:** Telegram rasmiy kanaliga (`@sharofovschool`) obuna bo‘lish va tugma bosilishini avtomatik tahlil qilish (`/api/track`).
- **2-Shart:**
  - Eslatma: *"Do‘stingiz kurs tanlab oylik to‘lovni qilishi bilanoq Sizga har bir do‘stingiz uchun 50 000 so‘m pul mukofoti taqdim etiladi."*
  - Telegram orqali do‘stlarga tayyor matn bilan ulashish va havolani nusxalash.
  - **Do‘stni ro‘yxatga qo‘shish formasi:** Foydalanuvchi o‘z ismi va telefoni, do‘stining ismi, telefoni va qiziqqan kursini kiritib yuboradi.
  - Ma’lumotlar zudlik bilan bazaga yoziladi, adminga Telegram bot orqali bildirishnoma yuboriladi va Admin Dashboardda ko‘rinadi.
- **Qayta ochish:** Foydalanuvchi modalni yopgach (X, ESC yoki fon orqali), asosiy saytdagi maxsus suzuvchi tugma orqali istalgan vaqtda qayta ochishi mumkin.

---

### 3. Admin Dashboard (`/admin`)
Xavfsiz login va maxfiy parol orqali boshqariladi:
- **Login:** `admin`
- **Parol:** `20042802` *(yoki `.env.local` dagi `ADMIN_PASSWORD`)*

#### Asosiy imkoniyatlar:
1. **Dinamik Vaqt Filtrlari:** Kunlik (bugun), Oxirgi 7 kun, Oylik (30 kun), Yillik (12 oy).
2. **Kuzatuv Kartochkalari:** QR kod skanerlari, kanal a’zolari (jonli konversiya foizi bilan), taklif qilingan do‘stlar, to‘langan mukofotlar.
3. **Do‘stlar va Mukofotlarni Boshqarish:**
   - Kim kimni taklif qilgan, telefon raqamlari va tanlagan kurslari jadvali.
   - Bir bosishda **"To‘lovni tasdiqlash"** va **"50 000 so‘m mukofot berildi"** deb belgilash (CRUD).
4. **QR Kod Generator va Chop Etish (Print Flyer):**
   - Sharofov School logotipi bilan yuqori sifatli QR kod.
   - Flayer va bannerlar uchun PNG yuklab olish va to‘g‘ridan-to‘g‘ri printerga chiqarish.
5. **Real-Vaqt Hodisalar Jurnali:**
   - Har bir skan, Telegram tugmasining bosilishi va referallarning jonli oqimi.

---

## 🤖 Telegram Bot Webhook Integratsiyasi (24/7 Vercel)

Loyiha serverless muhitda 24/7 ishlashi uchun rasmiy Telegram Webhook mexanizmidan foydalanadi:

- **Webhook URL:** `https://sizning-domen.vercel.app/api/telegram-webhook`
- Yangi start bosilganda bot avtomatik javob beradi va administrator bilan bog‘lanish tugmalarini taqdim etadi.
- Yangi referal va fikrlar qoldirilganda, tizim avtomatik ravishda admin log chatiga bildirishnoma yetkazadi.

---

## 🚀 Ishga Tushirish

1. Bog‘liqliklarni o‘rnatish:
   ```bash
   npm install
   ```

2. Ishlab chiqish rejimida ishga tushirish:
   ```bash
   npm run dev
   ```

3. Production uchun build qilish va ishga tushirish:
   ```bash
   npm run build
   npm run start
   ```

4. Brauzerda ochish:
   - Asosiy Sayt & Modal: [http://localhost:3000/](http://localhost:3000/)
   - Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Webhook Holati: [http://localhost:3000/api/telegram-webhook](http://localhost:3000/api/telegram-webhook)

---

## 🔒 Konfiguratsiya (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=sharofov_school_bot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=sharofov_school_bot
TELEGRAM_CHANNEL_ID=@sharofovschool
NEXT_PUBLIC_TELEGRAM_CHANNEL_URL=https://t.me/sharofovschool
TELEGRAM_LOG_CHAT_ID=your_telegram_chat_id

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_32_char_secret_key

NEXT_PUBLIC_SITE_URL=https://sharofov-school.vercel.app
```

---

© SHAROFOV SCHOOL. Barcha huquqlar himoyalangan.
