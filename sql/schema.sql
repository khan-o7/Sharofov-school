create extension if not exists pgcrypto;

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_name text not null default 'Noma’lum o‘quvchi',
  owner_student_id text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists scan_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references referrals(id) on delete set null,
  referral_code text not null,
  event_type text not null default 'landing_open',
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists scan_events_created_at_idx on scan_events(created_at desc);
create index if not exists scan_events_referral_code_idx on scan_events(referral_code);

create table if not exists subscription_checks (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null,
  referral_id uuid references referrals(id) on delete set null,
  referral_code text not null,
  is_member boolean not null,
  checked_at timestamptz not null default now()
);
create index if not exists subscription_checks_checked_at_idx on subscription_checks(checked_at desc);

create table if not exists participants (
  telegram_user_id bigint primary key,
  referral_id uuid references referrals(id) on delete set null,
  referral_code text not null,
  is_subscribed boolean not null default false,
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists reward_claims (
  id uuid primary key default gen_random_uuid(),
  referrer_telegram_user_id bigint not null references participants(telegram_user_id),
  invited_telegram_user_id bigint,
  referral_id uuid references referrals(id) on delete set null,
  course_name text,
  monthly_payment_amount numeric(12,2),
  payment_status text not null default 'pending' check (payment_status in ('pending','verified','rejected')),
  reward_status text not null default 'pending' check (reward_status in ('pending','approved','paid','rejected')),
  payment_verified_by text,
  payment_verified_at timestamptz,
  reward_paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reward_claims_status_idx on reward_claims(reward_status, payment_status);

-- Supabase service role is used only on the server. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
-- Optional hardening: enable RLS on all tables and keep all public browser access disabled.
alter table referrals enable row level security;
alter table scan_events enable row level security;
alter table subscription_checks enable row level security;
alter table participants enable row level security;
alter table reward_claims enable row level security;

-- One shared QR code for all visitors. The root URL redirects to /r/main.
insert into referrals(code, owner_name, owner_student_id)
values ('main', 'Sharofov School', 'SCHOOL-MAIN')
on conflict (code) do nothing;
