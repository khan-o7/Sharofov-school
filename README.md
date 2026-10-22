# Sharofov School — QR Referal va Mukofot Tizimi 🎓

Ushbu loyiha **Sharofov School** o‘quv markazi uchun maxsus ishlab chiqilgan premium darajadagi QR kod aksiya va referal platformasi hamda to‘liq ma’muriy tahlil (Admin Dashboard) tizimidir.

---

## 🌟 Loyiha Funksionalligi

### 1. Foydalanuvchi Sahifasi (QR Skaner qilinganda)
Foydalanuvchi QR kodni skaner qilishi bilanoq `/r/main` manziliga yo‘naltiriladi va quyidagi premium sahifa ochiladi:
- **Maxsus Tabrik va Yutuq E’loni:**
  - 3D oltin sovg‘a qutisi va diplom vizuali, bayramona konfetti animatsiyasi.
  - Sarlavha: **"Tabriklaymiz! Yutuqqa ega bo‘ldingiz!"**
  - Ajratilgan banner: **"50 000 so‘m pul mukofoti Sizniki bo‘lishi mumkin!"**
- **1-Shart:**
  - **Telegram kanalga obuna bo‘lish** (adminga taqdim etiladi): `https://t.me/sharofovschool`
  - Bir bosishda Telegram dasturida ochiladigan tugma (statistika uchun bosishlar soni qayd etiladi).
  - Obunani qayd etish: Foydalanuvchi o‘z username/telefonini kiritadi yoki Telegram widget orqali tasdiqlaydi.
- **2-Shart:**
  - **O‘z do‘stingizni taklif eting:**
  - Maxsus eslatma: *"Do‘stingiz kurs tanlab oylik to‘lovni qilishi bilanoq Sizga har bir do‘stingiz uchun 50 000 so‘m pul mukofoti taqdim etiladi."*
  - **Tezkor Ulashish:** Telegram orqali do‘stlarga tayyor matn bilan ulashish va havolani nusxalash tugmalari.
  - **Do‘stni Ro‘yxatga Qo‘shish (Anketa):** Foydalanuvchi o‘z ma’lumotlari va do‘stining ismi, telefoni hamda qiziqqan kursini yuboradi. Ma’lumotlar darhol Admin panelga tushadi!
- **Mukofot olish bosqichlari & Sharofov School kurslari.**

---

### 2. Admin Dashboard (`/admin`)
Xavfsiz login va maxfiy parol orqali kiriladi:
- **Login:** `admin`
- **Parol:** `20042802` *(yoki `.env.local` da belgilangan parol)*

#### Asosiy imkoniyatlar:
1. **Dinamik Vaqt Filtrlari:**
   - 📅 **Kunlik (Bugun):** Bugungi 24 soatlik soatbay skanerlar va kanalga a’zolar grafigi.
   - 📊 **Oxirgi 7 kun:** 7 kunlik dinamika grafigi.
   - 🗓️ **Oylik (Shu oy / 30 kun):** Shu oyning har bir kunidagi skanerlar dinamikasi.
   - 🏛️ **Yillik (Shu yil):** 12 oy (Yanvar–Dekabr) bo‘yicha to‘liq taqsimot.
2. **Kuzatuv Kartochkalari (Metrics):**
   - **QR Kod Skanerlari:** Jami, bugungi, oylik va yillik skanerlar soni.
   - **Kanal A’zolari:** Telegram Bot API orqali `@sharofovschool` kanalining jonli a’zolar soni, sayt orqali o‘tganlar va konversiya foizi.
   - **Taklif Qilingan Do‘stlar:** Jami ro‘yxatga olingan referallar soni.
   - **To‘langan Mukofotlar:** To‘langan 50 000 so‘mlik mukofotlar soni va jami summasi.
3. **Do‘stlar va Mukofotlarni Boshqarish:**
   - Kim kimni taklif qilgan, telefon raqamlari va tanlagan kurslari jadvali.
   - Bir bosishda **"To‘lovni tasdiqlash"** va **"50 000 so‘m mukofot berildi"** deb belgilash imkoniyati.
4. **QR Kod Generator va Chop Etish (Print Flyer):**
   - Sharofov School logotipi bilan yuqori sifatli QR kod.
   - PNG formatida yuklab olish (banner va flayerlar uchun).
   - Tayyor A4/A5 targ‘ibot varaqasini printerdan chiqarish (Print).
5. **Real-Vaqt Hodisalar Jurnali:**
   - Har bir skan, Telegram tugmasining bosilishi va referal yozuvlarining Toshkent vaqti bilan jonli oqimi.

---

## 🚀 Ishga Tushirish (Local Run)

1. Bog‘liqliklarni o‘rnatish:
   ```bash
   npm install
   ```
2. Loyihani ishga tushirish:
   ```bash
   npm run dev
   ```
3. Brauzerda ochish:
   - Aksiya sahifasi (QR manzil): [http://localhost:3000/](http://localhost:3000/)
   - Admin Boshqaruv: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔒 Xavfsizlik va Konfiguratsiya (`.env.local`)
- `ADMIN_USERNAME`: Admin login
- `ADMIN_PASSWORD`: Admin parol
- `SESSION_SECRET`: JWT shifrlash kaliti
- `TELEGRAM_BOT_TOKEN`: Telegram bot tokeni
- `TELEGRAM_CHANNEL_ID`: `@sharofovschool`
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase loyiha manzili
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase maxfiy kaliti
