-- Run in Supabase Dashboard → SQL Editor.
-- Reuses the same public.notify_email_webhook() function created earlier
-- (in emaxinvest_webhooks_v2.sql) — just attaches it to kyc_verifications
-- too, so approve/reject decisions also notify the user.

create trigger kyc_verification_emails
after update on public.kyc_verifications
for each row execute function public.notify_email_webhook();

-- Verify:
select trigger_name, event_manipulation, event_object_table
from information_schema.triggers
where trigger_name = 'kyc_verification_emails';
