-- Run in Supabase Dashboard → SQL Editor.
-- Adds pause/resume tracking to Investment for admin full control.
-- Run each statement separately if you hit a deadlock (same as the KYC setup).

alter table public."Investment" add column if not exists paused boolean not null default false;
alter table public."Investment" add column if not exists paused_at timestamp with time zone;
alter table public."Investment" add column if not exists total_paused_days integer not null default 0;
alter table public."Investment" add column if not exists pause_reason text;

-- Verify:
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'Investment'
  and column_name in ('paused', 'paused_at', 'total_paused_days', 'pause_reason');
