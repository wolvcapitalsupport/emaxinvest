import { BRAND, DetailRow, displayName, formatCurrency, formatDate, renderLayout } from "./email.ts";

type Email = { subject: string; html: string };

const appLink = (path: string) => `${BRAND.appUrl}${path}`;

// ---------------------------------------------------------------------------
// Auth emails (replace Supabase's built-in signup confirmation + recovery)
// ---------------------------------------------------------------------------

export function signupConfirmationEmail(opts: { email: string; confirmUrl: string }): Email {
  return {
    subject: "Confirm your EMAX Invest account",
    html: renderLayout({
      preheader: "Confirm your email address to activate your EMAX Invest account.",
      heading: "Confirm your email address",
      bodyHtml: `
        <p>Thank you for creating an account with EMAX Invest.</p>
        <p>Please confirm <strong>${opts.email}</strong> to activate your account and start investing.</p>
        <p style="color:${BRAND.colors.muted};font-size:12px;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
      `,
      ctaLabel: "Confirm my email",
      ctaUrl: opts.confirmUrl,
      includeUnsubscribe: false,
    }),
  };
}

export function passwordResetEmail(opts: { email: string; resetUrl: string }): Email {
  return {
    subject: "Reset your EMAX Invest password",
    html: renderLayout({
      preheader: "Use this link to reset your EMAX Invest password.",
      heading: "Reset your password",
      bodyHtml: `
        <p>We received a request to reset the password for <strong>${opts.email}</strong>.</p>
        <p>Click below to choose a new password. If you didn't request this, no action is needed — your password will not be changed.</p>
        <p style="color:${BRAND.colors.muted};font-size:12px;">This link expires in 1 hour for your security.</p>
      `,
      ctaLabel: "Reset my password",
      ctaUrl: opts.resetUrl,
      includeUnsubscribe: false,
    }),
  };
}

// ---------------------------------------------------------------------------
// Investment lifecycle
// ---------------------------------------------------------------------------

export function investmentSubmittedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Amount", value: formatCurrency(inv.amount) },
    { label: "Expected return", value: formatCurrency(inv.expected_return) },
    { label: "Duration", value: `${inv.duration_days} days` },
    { label: "Payment method", value: inv.payment_method || "—" },
  ];
  return {
    subject: `Investment submitted — ${inv.plan} plan`,
    html: renderLayout({
      preheader: "Your investment has been submitted and is awaiting approval.",
      heading: "Investment submitted",
      bodyHtml: `<p>Hi ${name},</p><p>We've received your investment request for the <strong>${inv.plan}</strong> plan. It is now pending admin review — you'll receive another email as soon as it's approved.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

export function investmentApprovedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Amount", value: formatCurrency(inv.amount) },
    { label: "ROI", value: `${inv.roi_percentage}%` },
    { label: "Matures", value: formatDate(inv.maturity_date) },
  ];
  return {
    subject: `Investment approved — ${inv.plan} plan is now active`,
    html: renderLayout({
      preheader: "Your investment has been approved and is now active.",
      heading: "Your investment is now active",
      bodyHtml: `<p>Hi ${name},</p><p>Good news — your <strong>${inv.plan}</strong> plan investment has been approved and is now active. Returns will begin accruing toward your maturity date below.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

export function investmentRejectedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Amount", value: formatCurrency(inv.amount) },
    { label: "Reason", value: inv.admin_note || "Not specified" },
  ];
  return {
    subject: `Investment not approved — ${inv.plan} plan`,
    html: renderLayout({
      preheader: "Your recent investment submission was not approved.",
      heading: "Investment not approved",
      bodyHtml: `<p>Hi ${name},</p><p>Unfortunately we were unable to approve your <strong>${inv.plan}</strong> plan investment. See the note below for details, or contact support if you have questions.</p>`,
      details,
      ctaLabel: "Submit a new investment",
      ctaUrl: appLink("/invest"),
      includeUnsubscribe: true,
    }),
  };
}

export function principalReleaseApprovedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Principal released", value: formatCurrency(inv.amount) },
    { label: "Released on", value: formatDate(inv.principal_released_date) },
  ];
  return {
    subject: `Principal released — ${inv.plan} plan`,
    html: renderLayout({
      preheader: "Your matured principal has been released to your wallet.",
      heading: "Principal released to your wallet",
      bodyHtml: `<p>Hi ${name},</p><p>Your matured <strong>${inv.plan}</strong> plan principal has been released and credited to your wallet balance. It's available to withdraw now.</p>`,
      details,
      ctaLabel: "View my wallet",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

export function principalReleaseRejectedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Amount rolled over", value: formatCurrency(inv.amount) },
    { label: "Note", value: inv.admin_note || "Rolled over into a new cycle" },
  ];
  return {
    subject: `Principal release request declined — ${inv.plan} plan renewed`,
    html: renderLayout({
      preheader: "Your principal release request was declined; your capital has been renewed into a new cycle.",
      heading: "Your capital has been renewed",
      bodyHtml: `<p>Hi ${name},</p><p>Your request to release principal from your <strong>${inv.plan}</strong> plan was declined. Instead, your capital has automatically renewed into a new investment cycle of the same plan.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

// ---------------------------------------------------------------------------
// Withdrawals
// ---------------------------------------------------------------------------

export function withdrawalSubmittedEmail(w: any): Email {
  const name = displayName(w.user_name, w.user_email);
  const details: DetailRow[] = [
    { label: "Amount", value: formatCurrency(w.amount) },
    { label: "Wallet type", value: w.wallet_type },
    { label: "Destination", value: w.wallet_address },
  ];
  return {
    subject: "Withdrawal request received",
    html: renderLayout({
      preheader: "Your withdrawal request has been received and is pending review.",
      heading: "Withdrawal request received",
      bodyHtml: `<p>Hi ${name},</p><p>We've received your withdrawal request. It's pending admin review — you'll be notified as soon as it's processed.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/withdraw"),
      includeUnsubscribe: true,
    }),
  };
}

export function withdrawalApprovedEmail(w: any): Email {
  const name = displayName(w.user_name, w.user_email);
  const details: DetailRow[] = [
    { label: "Amount", value: formatCurrency(w.amount) },
    { label: "Wallet type", value: w.wallet_type },
  ];
  return {
    subject: "Withdrawal approved",
    html: renderLayout({
      preheader: "Your withdrawal request has been approved and is being processed.",
      heading: "Withdrawal approved",
      bodyHtml: `<p>Hi ${name},</p><p>Your withdrawal request has been approved and is now being processed for payout. You'll receive a final confirmation once the funds have been sent.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/withdraw"),
      includeUnsubscribe: true,
    }),
  };
}

export function withdrawalRejectedEmail(w: any): Email {
  const name = displayName(w.user_name, w.user_email);
  const details: DetailRow[] = [
    { label: "Amount", value: formatCurrency(w.amount) },
    { label: "Reason", value: w.admin_note || "Not specified" },
  ];
  return {
    subject: "Withdrawal request declined",
    html: renderLayout({
      preheader: "Your recent withdrawal request could not be processed.",
      heading: "Withdrawal request declined",
      bodyHtml: `<p>Hi ${name},</p><p>We were unable to process your withdrawal request. See the note below, or contact support if you have questions. The requested amount remains available in your wallet balance.</p>`,
      details,
      ctaLabel: "View my wallet",
      ctaUrl: appLink("/withdraw"),
      includeUnsubscribe: true,
    }),
  };
}

export function withdrawalPaidEmail(w: any): Email {
  const name = displayName(w.user_name, w.user_email);
  const details: DetailRow[] = [
    { label: "Amount", value: formatCurrency(w.amount) },
    { label: "Wallet type", value: w.wallet_type },
    { label: "Destination", value: w.wallet_address },
  ];
  return {
    subject: "Funds sent — withdrawal complete",
    html: renderLayout({
      preheader: "Your withdrawal has been paid out.",
      heading: "Your withdrawal has been sent",
      bodyHtml: `<p>Hi ${name},</p><p>Your withdrawal has been paid out to the destination below. Depending on network conditions, it may take a short time to arrive.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

// ---------------------------------------------------------------------------
// Account status
// ---------------------------------------------------------------------------

export function accountStatusChangedEmail(profile: any): Email {
  const name = displayName(profile.full_name, profile.user_email);
  const status = String(profile.account_status || "").toLowerCase();
  const isSuspended = status === "suspended" || status === "disabled" || status === "blocked";
  return {
    subject: isSuspended ? "Your EMAX Invest account has been suspended" : "Your EMAX Invest account status has changed",
    html: renderLayout({
      preheader: isSuspended
        ? "Your account access has been suspended."
        : "Your account status has been updated.",
      heading: isSuspended ? "Account suspended" : "Account status updated",
      bodyHtml: isSuspended
        ? `<p>Hi ${name},</p><p>Your EMAX Invest account has been suspended. If you believe this is in error, please contact support.</p>`
        : `<p>Hi ${name},</p><p>Your EMAX Invest account status has been updated to <strong>${profile.account_status}</strong>.</p>`,
      ctaLabel: "Contact support",
      ctaUrl: `mailto:${BRAND.supportEmail}`,
      includeUnsubscribe: false,
    }),
  };
}

// ---------------------------------------------------------------------------
// Admin-composed (manual send from Admin panel)
// ---------------------------------------------------------------------------

export function adminCustomEmail(opts: { name: string; subject: string; message: string }): Email {
  // message may contain simple line breaks from a textarea; convert to <br/>
  // paragraphs. Not full markdown — kept intentionally simple/safe.
  const safeParagraphs = opts.message
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return {
    subject: opts.subject,
    html: renderLayout({
      preheader: opts.subject,
      heading: opts.subject,
      bodyHtml: `<p>Hi ${opts.name},</p>${safeParagraphs}`,
      includeUnsubscribe: true,
    }),
  };
}

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------

export function contactAutoReplyEmail(opts: { name: string; message: string }): Email {
  return {
    subject: "We've received your message — EMAX Invest",
    html: renderLayout({
      preheader: "Thanks for reaching out — our team will respond shortly.",
      heading: "We've received your message",
      bodyHtml: `<p>Hi ${opts.name || "there"},</p><p>Thank you for contacting EMAX Invest. Our support team typically responds within one business day. For urgent matters, you can also reach us directly at <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.colors.iceBlueStart};">${BRAND.supportEmail}</a>.</p>`,
      includeUnsubscribe: false,
    }),
  };
}

export function contactAdminNotifyEmail(opts: { name: string; email: string; subject: string; message: string }): Email {
  const details: DetailRow[] = [
    { label: "From", value: `${opts.name} <${opts.email}>` },
    { label: "Subject", value: opts.subject || "(no subject)" },
  ];
  return {
    subject: `New contact form submission: ${opts.subject || "(no subject)"}`,
    html: renderLayout({
      preheader: "New message submitted through the EMAX Invest contact form.",
      heading: "New contact form submission",
      bodyHtml: `<p>${details.map((d) => `<strong>${d.label}:</strong> ${d.value}`).join("<br/>")}</p><p style="margin-top:16px;white-space:pre-wrap;border-left:2px solid ${BRAND.colors.border};padding-left:12px;">${opts.message}</p>`,
      includeUnsubscribe: false,
    }),
  };
}

export function investmentPausedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Amount", value: formatCurrency(inv.amount) },
    { label: "Reason", value: inv.pause_reason || "Not specified" },
  ];
  return {
    subject: `Investment paused — ${inv.plan} plan`,
    html: renderLayout({
      preheader: "Your investment has been temporarily paused.",
      heading: "Your investment has been paused",
      bodyHtml: `<p>Hi ${name},</p><p>Your <strong>${inv.plan}</strong> plan investment has been paused by our team. Returns will not accrue while it's paused. See below for the reason, or contact support with any questions.</p>`,
      details,
      ctaLabel: "Contact support",
      ctaUrl: `mailto:${BRAND.supportEmail}`,
      includeUnsubscribe: true,
    }),
  };
}

export function investmentResumedEmail(inv: any): Email {
  const name = displayName(inv.user_name, inv.user_email);
  const details: DetailRow[] = [
    { label: "Plan", value: inv.plan },
    { label: "Amount", value: formatCurrency(inv.amount) },
  ];
  return {
    subject: `Investment resumed — ${inv.plan} plan`,
    html: renderLayout({
      preheader: "Your investment has resumed accruing returns.",
      heading: "Your investment has resumed",
      bodyHtml: `<p>Hi ${name},</p><p>Your <strong>${inv.plan}</strong> plan investment is active again and returns have resumed accruing.</p>`,
      details,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

export function kycApprovedEmail(opts: { name: string; email: string }): Email {
  return {
    subject: "Identity verification approved",
    html: renderLayout({
      preheader: "Your identity has been verified.",
      heading: "You're verified",
      bodyHtml: `<p>Hi ${opts.name},</p><p>Your identity verification has been approved. Your account is now fully verified — no further action is needed.</p>`,
      ctaLabel: "View my dashboard",
      ctaUrl: appLink("/dashboard"),
      includeUnsubscribe: true,
    }),
  };
}

export function kycRejectedEmail(opts: { name: string; email: string; reason?: string }): Email {
  const details: DetailRow[] = [{ label: "Reason", value: opts.reason || "Not specified" }];
  return {
    subject: "Identity verification declined",
    html: renderLayout({
      preheader: "We were unable to verify your identity with the documents provided.",
      heading: "Verification declined",
      bodyHtml: `<p>Hi ${opts.name},</p><p>We were unable to verify your identity with the documents you submitted. See the reason below, then resubmit your documents when ready.</p>`,
      details,
      ctaLabel: "Resubmit documents",
      ctaUrl: appLink("/kyc"),
      includeUnsubscribe: true,
    }),
  };
}

// ---------------------------------------------------------------------------
// Admin notifications
// ---------------------------------------------------------------------------

export function adminNewInvestmentEmail(inv: any): Email {
  const details: DetailRow[] = [
    { label: "User", value: `${inv.user_name || "—"} <${inv.user_email}>` },
    { label: "Plan", value: inv.plan },
    { label: "Amount", value: formatCurrency(inv.amount) },
    { label: "Payment method", value: inv.payment_method || "—" },
  ];
  return {
    subject: `New pending investment — ${inv.plan} (${formatCurrency(inv.amount)})`,
    html: renderLayout({
      preheader: "A new investment is awaiting your approval.",
      heading: "New investment pending approval",
      bodyHtml: `<p>A new investment submission needs review.</p>`,
      details,
      ctaLabel: "Review in admin panel",
      ctaUrl: appLink("/admin"),
      includeUnsubscribe: false,
    }),
  };
}

export function adminNewWithdrawalEmail(w: any): Email {
  const details: DetailRow[] = [
    { label: "User", value: `${w.user_name || "—"} <${w.user_email}>` },
    { label: "Amount", value: formatCurrency(w.amount) },
    { label: "Wallet type", value: w.wallet_type },
    { label: "Destination", value: w.wallet_address },
  ];
  return {
    subject: `New pending withdrawal — ${formatCurrency(w.amount)}`,
    html: renderLayout({
      preheader: "A new withdrawal request is awaiting your approval.",
      heading: "New withdrawal pending approval",
      bodyHtml: `<p>A new withdrawal request needs review.</p>`,
      details,
      ctaLabel: "Review in admin panel",
      ctaUrl: appLink("/admin"),
      includeUnsubscribe: false,
    }),
  };
}
