# EMAX Invest — Transactional Email System

Built with [Resend](https://resend.com). Sending happens **entirely server-side**
in three Supabase Edge Functions — the Resend API key never touches the
browser.

## Architecture

This app has no traditional backend (it's a Vite SPA talking directly to
Supabase), and almost every state change — investment approval, withdrawal
approval, account status — happens as a direct table `update()` call from
the browser (`Admin.jsx`, `AdminUsers.jsx`). To send email reliably no
matter where a write comes from (today's admin UI, a future admin tool, a
SQL console fix, etc.), sending is wired up via **Postgres Database
Webhooks**, not by calling an edge function from each click handler. A
Database Webhook fires automatically whenever a row is inserted/updated in
`Investment`, `WithdrawalRequest`, or `UserProfile`, and calls the
`db-email-webhook` edge function, which inspects what changed and sends the
right email.

Auth emails (signup confirmation, password reset) use a separate mechanism:
Supabase's **Auth "Send Email" Hook**, which lets us fully replace
Supabase's own default emails with our branded Resend templates.

## Edge functions (in `supabase/functions/`)

| Function | Purpose | Invoked by |
|---|---|---|
| `auth-email-hook` | Signup confirmation + password reset | Supabase Auth "Send Email" Hook |
| `db-email-webhook` | All investment/withdrawal/account-status emails + admin notifications | Postgres Database Webhooks (3x) |
| `send-contact-email` | Contact form admin-notify + user auto-reply | Called directly from `src/pages/Contact.jsx` |
| `admin-send-email` | Manual single/broadcast email from the Admin panel | Called from `src/components/admin/AdminSendEmail.jsx` (new "Emails" tab in Admin) |
| `_shared/email.ts` | Brand constants, HTML layout, Resend send helper | (shared code, not deployed standalone) |
| `_shared/templates.ts` | All 16 email subject/body builders | (shared code, not deployed standalone) |

## Every email implemented

**User-facing:**
1. Signup confirmation — `auth-email-hook`, replaces Supabase default
2. Password reset — `auth-email-hook`, replaces Supabase default
3. Investment submitted (pending) — `Investment` INSERT, status `pending`
4. Investment approved — `Investment` UPDATE, `pending` → `active`
5. Investment rejected — `Investment` UPDATE, `pending` → `rejected`
6. Principal released (payout approved) — `Investment` UPDATE, `matured_awaiting_release` → `completed` with `principal_released = true`
7. Principal release declined / rolled over — `Investment` UPDATE, `matured_awaiting_release` → `completed` with `principal_released` not true
8. Withdrawal request received — `WithdrawalRequest` INSERT, status `pending`
9. Withdrawal approved — `WithdrawalRequest` UPDATE, `pending` → `approved`
10. Withdrawal rejected — `WithdrawalRequest` UPDATE, `pending` → `rejected`
11. Withdrawal paid — `WithdrawalRequest` UPDATE, `approved` → `paid`
12. Account status changed — `UserProfile` UPDATE, `account_status` changes
13. Contact form auto-reply — `send-contact-email`, called from Contact page

**Admin-facing (sent to `support@emaxinvest.site`):**
14. New pending investment — same trigger as #3
15. New pending withdrawal — same trigger as #8
16. New contact form submission — same trigger as #13

## Frontend changes made

- **`src/pages/Register.jsx`** — added a required Full Name field. Previously
  signup only collected email/password, so `user.full_name` was always
  `undefined` everywhere it's used (Invest, Withdraw, Dashboard). Now it's
  passed as Supabase auth user metadata on signup.
- **`src/api/base44Client.js`** — `register()` now accepts and forwards
  `full_name`; `normalizeAuthUser()` now surfaces `full_name` from
  `user_metadata` onto the returned user object, since the rest of the app
  reads `user.full_name` directly.
- **`src/pages/Contact.jsx`** — the form previously did nothing (`handleSubmit`
  just flipped a `sent` flag with no network call). It now calls the
  `send-contact-email` edge function and shows an error state if delivery
  fails, while an already-sent thank-you screen elsewhere in the page still
  renders on success.

## Admin "Send Email" panel

A new **Emails** tab in the Admin page (`src/components/admin/AdminSendEmail.jsx`)
lets an admin manually send a branded email to a single user (by email,
with autocomplete from existing users) or broadcast to every registered
user. Two compose modes:
- **Free-form** — subject + message, dropped into the same branded layout as every other email.
- **Template** — pick one of the existing transactional templates (Investment Approved, Withdrawal Paid, etc.) and fill in a small form — useful for manually resending something if an automated email failed or was needed retroactively.

Broadcast sends ask for a confirmation click before firing, and are sent in
small batches with brief pauses between them to stay under Resend's rate
limits.

**Security:** this is the only function in the project that can message
every user at once, so it's locked down more tightly than the others:
- Deployed **with** JWT verification (no `--no-verify-jwt` flag) — Supabase's gateway rejects unauthenticated requests before they reach the function at all.
- Server-side admin role check against the `UserProfile` table using the service-role key — the function never trusts anything the client claims about its own role.

Deploy it like this (note: no `--no-verify-jwt`, unlike the other three):
```bash
supabase functions deploy admin-send-email
```
No additional secrets needed — it uses the `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
and `SUPABASE_SERVICE_ROLE_KEY` secrets Supabase provides automatically to
every edge function, plus the `RESEND_API_KEY` you already set.

## Admin investment control (pause / resume / edit)

New buttons on each active investment in the Admin → Investments tab:
- **Pause** — requires a mandatory reason (prompted before the action fires). Freezes ROI accrual completely; the investment's `maturity_date` does **not** move, so paused days are permanently excluded from what gets credited rather than caught up later. This is enforced in the actual accrual math (`computeDueRoiAccrual` in both `src/lib/plans.js` and `supabase/functions/daily-roi-accrual/index.ts` — kept in sync, both check `investment.paused` and subtract `total_paused_days`), not just hidden in the UI.
- **Resume** — records how many days it was paused into `total_paused_days` (permanent), clears the pause state.
- **Edit** — directly change amount, ROI %, and maturity date on a running investment. `expected_return` is recalculated automatically to stay consistent.

Requires the new columns from `investment_pause_setup.sql` (see below) — run it once before using these buttons, or every click will fail since the columns won't exist yet.

**Emails:** pausing/resuming now also sends a branded email to the investor (via `db-email-webhook`, same Database Webhook trigger already watching `Investment` — no new setup needed since it's the same table).

## KYC decision emails

Approving or rejecting a KYC submission in the Admin → KYC tab now emails the user automatically. This needed a new trigger since `kyc_verifications` wasn't wired to the webhook system before — run `kyc_email_trigger.sql` once (reuses the same shared trigger function from the earlier webhook setup, just attaches it to this table too).

## KYC status badge

Regular (non-admin) users see a status pill in the top-right of every page: red "Not Verified" (links to `/kyc`), amber "Verification Pending", or blue "Verified". Reads directly from `kyc_verifications`, no extra setup needed beyond the KYC RLS policies already covered above.

## Required manual setup steps

### 1. Deploy the edge functions
```bash
supabase functions deploy auth-email-hook --no-verify-jwt
supabase functions deploy db-email-webhook --no-verify-jwt
supabase functions deploy send-contact-email --no-verify-jwt
supabase functions deploy admin-send-email
```

### 2. Set secrets
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set APP_BASE_URL=https://emaxinvest.site
supabase secrets set SEND_EMAIL_HOOK_SECRET=whsec_xxxxxxxxxxxx   # from step 3 below
supabase secrets set DB_WEBHOOK_SECRET=<generate your own random string>  # from step 4 below
```

### 3. Enable the Auth Send Email Hook
Dashboard → **Authentication → Hooks → Send Email Hook**:
- Enable it, point it at the deployed `auth-email-hook` function URL
  (Dashboard shows you the URL after deploy, or `supabase functions list`).
- The Dashboard generates a signing secret (`whsec_...`) when you enable
  it — copy that into `SEND_EMAIL_HOOK_SECRET` above.
- Once enabled, Supabase stops sending its own confirmation/reset emails
  and calls this function for every auth email instead.

### 4. Create the three Database Webhooks

**Option A — Dashboard UI:** Dashboard → **Database → Webhooks → Create a new hook**, once each for `Investment` (Insert+Update), `WithdrawalRequest` (Insert+Update), and `UserProfile` (Update only), each POSTing to the `db-email-webhook` function URL with header `x-webhook-secret: <DB_WEBHOOK_SECRET>`.

**Option B — SQL (used for this project):** if the Dashboard webhook UI 404s or `supabase_functions.http_request` doesn't exist on your project yet, run the equivalent directly via `pg_net` in the SQL Editor instead — see `emaxinvest_webhooks_v2.sql` for the exact script (creates one shared trigger function + attaches it to all three tables). Both options do the same thing; SQL just doesn't depend on the Dashboard webhook page having been visited before.

### 5. Verify the sending domain in Resend
Add and verify `info.emaxinvest.site` in the Resend dashboard (SPF/DKIM
DNS records) so mail sends from `help@info.emaxinvest.site` without
landing in spam. Nothing in code depends on this beyond the `from` address
already being set correctly in `supabase/functions/_shared/email.ts`.

## Not included (flagged during scoping, confirmed out of scope)

- **KYC status emails** — no KYC feature exists anywhere in this codebase
  (no fields, table, or flow), so nothing was built for it.
- **Login alerts** — no session/device tracking exists in the app to hang
  this off of.
- **Self-service profile/security-change emails** — there's no
  profile/settings page in the app for a user to change their own email or
  password while logged in (only the forgot-password flow, which is
  covered above).

## Notes on failure handling

Every send goes through `sendEmail()` in `_shared/email.ts`, which never
throws — a failed Resend call is logged (`console.error`, visible in
`supabase functions logs <name>`) but never blocks or rolls back the
underlying database write that triggered it.
