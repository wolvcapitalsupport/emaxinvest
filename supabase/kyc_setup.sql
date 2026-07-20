-- Run in Supabase Dashboard → SQL Editor.
-- Sets up the private storage bucket for KYC files, storage-level RLS, and
-- bridges admin access on kyc_verifications/kyc_documents to your app's own
-- admin system (UserProfile.role = 'admin') rather than relying only on
-- Supabase's project-level is_super_admin flag, which your app admins don't
-- have.

-- 1. Create the private bucket (safe to run even if it already exists)
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- 2. Storage RLS: users can upload/read their own files only. Files must be
--    stored with the user's id as the first path segment, e.g.
--    "<user_id>/<verification_id>/id_front-<timestamp>.jpg"
create policy "kyc_storage_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'kyc-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "kyc_storage_select_own"
on storage.objects for select
using (
  bucket_id = 'kyc-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- NOTE: UserProfile has no `role` column (confirmed against the live
-- schema), so admin status here is determined purely from the auth JWT's
-- metadata — matching the exact fallback chain isAdminUser() checks in
-- src/api/base44Client.js. A small helper function keeps this from being
-- repeated across every policy below.
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'account_role') = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'account_role') = 'admin',
    false
  );
$$;

-- 3. Storage RLS: app admins can read any file in this bucket, so they can
--    review submissions.
create policy "kyc_storage_select_admin_app"
on storage.objects for select
using (
  bucket_id = 'kyc-documents'
  and public.is_app_admin()
);

-- 4. Bridge table-level RLS: add SELECT + UPDATE policies for app admins on
--    both KYC tables. (The existing *_update_admin policies only recognize
--    Supabase's built-in is_super_admin flag, and there was no SELECT
--    policy for admins at all yet — without this, admins could not even
--    list submissions to review them.)

create policy "kyc_verifications_select_admin_app"
on public.kyc_verifications for select
using ( public.is_app_admin() );

create policy "kyc_verifications_update_admin_app"
on public.kyc_verifications for update
using ( public.is_app_admin() )
with check ( public.is_app_admin() );

create policy "kyc_documents_select_admin_app"
on public.kyc_documents for select
using ( public.is_app_admin() );

-- Verify:
select tablename, policyname, cmd
from pg_policies
where tablename in ('kyc_documents', 'kyc_verifications', 'objects')
order by tablename, policyname;
