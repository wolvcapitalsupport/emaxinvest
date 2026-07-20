-- Run this in Supabase Dashboard → SQL Editor.
-- Replace YOUR_DB_WEBHOOK_SECRET with the actual value you set via:
--   supabase secrets set DB_WEBHOOK_SECRET=...
-- (must match exactly in both places, or db-email-webhook will reject every call with 401)

-- 0. Make sure pg_net is enabled (it usually is by default, this is a no-op if so)
create extension if not exists pg_net with schema extensions;

-- 1. One shared trigger function used by all three tables. It reads which
--    table/operation fired it from Postgres's own TG_OP / TG_TABLE_NAME,
--    and posts a payload shaped exactly like what db-email-webhook expects.
create or replace function public.notify_email_webhook()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW),
    'old_record', case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end
  );

  perform net.http_post(
    url := 'https://fblcjkacqtrxpxozabvt.supabase.co/functions/v1/db-email-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'YOUR_DB_WEBHOOK_SECRET'
    ),
    body := payload
  );

  return NEW;
end;
$$;

-- 2. Attach it to the three tables

create trigger investment_emails
after insert or update on public."Investment"
for each row execute function public.notify_email_webhook();

create trigger withdrawal_emails
after insert or update on public."WithdrawalRequest"
for each row execute function public.notify_email_webhook();

create trigger account_status_emails
after update on public."UserProfile"
for each row execute function public.notify_email_webhook();

-- 3. Verify they were created:
select trigger_name, event_manipulation, event_object_table
from information_schema.triggers
where trigger_name in ('investment_emails', 'withdrawal_emails', 'account_status_emails');
