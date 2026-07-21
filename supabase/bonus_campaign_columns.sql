-- Run in Supabase Dashboard → SQL Editor.
-- Adds columns needed for the "bonus" campaign type: a real flat-dollar
-- credit that gets applied once to every active user's wallet.

alter table public."Campaign"
  add column if not exists bonus_amount numeric,
  add column if not exists applied boolean not null default false;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'Campaign';
