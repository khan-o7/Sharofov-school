# Sharofov School QR Referal (starter)

Next.js + Vercel Functions + Supabase PostgreSQL + Telegram channel membership check.

## What this starter includes
- One shared QR entrypoint: `/` redirects to `/r/main`
- Referral landing route supports `/r/[code]` for future referral campaigns
- Scan-event logging to PostgreSQL
- Telegram Login Widget assertion validation
- Telegram channel membership verification through `getChatMember`
- Admin login with an HTTP-only signed session cookie
- Admin dashboard showing total/today scans, subscribed participants and latest scan events
- SQL schema for referrals, scans, subscription checks, participants and reward claims

## Requirements
- Node.js 20.9+ recommended
- A Supabase project
- A Telegram bot created with `@BotFather`
- Bot added as an administrator in `@sharofovschool`
- Telegram Login Widget configured for your site domain with BotFather `/setdomain`

## Local setup
1. Copy `.env.example` to `.env.local` and fill in all values.
2. In Supabase SQL Editor, run `sql/schema.sql`.
3. Create a Telegram bot with `@BotFather`; set the login domain to `localhost` for local testing if supported by your setup and to your production domain after deployment.
4. Add the bot as administrator to `@sharofovschool`, with permission to view members. Keep the bot token private.
5. Create a referral record in Supabase, for example:

   ```sql
   insert into referrals(code, owner_name, owner_student_id)
   values ('main', 'Sharofov School', 'SCHOOL-001');
   ```

6. Install and run:

   ```bash
   npm install
   npm run dev
   ```

7. Open `http://localhost:3000/` (this is the one shared QR destination) and `http://localhost:3000/admin`.

## Deploy to Vercel
1. Push this project to a private GitHub repository.
2. Import the repository in Vercel.
3. Add every variable from `.env.example` in Vercel Project Settings -> Environment Variables.
4. Set `NEXT_PUBLIC_SITE_URL` to your real HTTPS Vercel domain.
5. Configure the Telegram Login Widget domain with `@BotFather` using the deployed hostname.
6. Run the SQL schema in Supabase before testing; it automatically creates the shared `main` referral code.
7. Redeploy after environment variable changes.

## Security notes
- Do not commit `.env.local` or share bot/service-role secrets.
- Use a unique admin password and a random `SESSION_SECRET` of at least 32 characters.
- The Supabase service-role key must only be used in server-side code.
- This starter's admin credential is a single environment-configured account; add per-admin accounts, rate limiting, audit logs and password hashing before production if multiple admins are needed.
- Scan events count requests to `/r/[code]`, not physical camera scans that never open the link. Preview bots may open links; filter suspicious requests before using counts for prizes.
- The reward schema is included, but payment verification and marking rewards as paid are not yet wired into admin UI. The admin dashboard currently shows scan totals, a 7-day scan table, subscribed participants, and Telegram channel member count when the Bot API is configured correctly.
- For reliable day-based reports, use the `Asia/Tashkent` timezone when querying or grouping timestamps.

## What the scan count means
The system records a visit when the shared QR destination opens in a browser. It cannot detect a QR code that was scanned by a camera if the visitor never opens the link. Link preview bots may also create visits, so use the scan log as landing-page opens rather than a perfect count of physical camera scans.
