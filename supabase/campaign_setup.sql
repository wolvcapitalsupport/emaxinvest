-- Run in Supabase Dashboard → SQL Editor.
-- Creates the Campaign table used for login popups, bonus announcements,
-- and periodic plan-entry discounts.

create table if not exists public."Campaign" (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('announcement', 'bonus', 'discount')),
  title text not null,
  message text not null,
  plan_name text, -- required when type = 'discount', must match a plan name in lib/plans.js
  discounted_amount numeric, -- required when type = 'discount' — the new, real minimum entry amount
  starts_at timestamp with time zone not null default now(),
  ends_at timestamp with time zone not null,
  active boolean not null default true,
  created_date timestamp with time zone not null default now()
);

alter table public."Campaign" enable row level security;

-- Anyone authenticated can read campaigns (needed to show the popup/discount to all users)
create policy if not exists "Campaign read for authenticated"
  on public."Campaign" for select
  to authenticated
  using (true);

-- Only admins can write (matches the JWT app_metadata.role = 'admin' pattern used elsewhere)
create policy if not exists "Campaign write for admins"
  on public."Campaign" for all
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Verify:
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'Campaign';
