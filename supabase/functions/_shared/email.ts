// Shared brand constants, HTML layout, and Resend send helper used by every
// transactional email edge function (auth-email-hook, db-email-webhook,
// send-contact-email). Keeping this in one place means every email looks
// consistent and brand details only need to be edited in one file.

export const BRAND = {
  fromName: "EMAX Invest",
  fromAddress: "help@info.emaxinvest.site",
  replyTo: "help@info.emaxinvest.site",
  supportEmail: "support@emaxinvest.site",
  adminNotifyEmail: "support@emaxinvest.site",
  appUrl: Deno.env.get("APP_BASE_URL") || "https://emaxinvest.site",
  disclaimer: "EMAX Invest is not a bank. Capital at risk.",
  // Colors pulled from the app's own Tailwind CSS variables / inline styles.
  colors: {
    midnight: "#0a0c14", // --background
    panel: "#12141e", // --card
    border: "#22242f",
    ink: "#e7ecf5", // --foreground
    muted: "#8b93a6", // --muted-foreground
    iceBlueStart: "#93C5FD",
    iceBlueEnd: "#BFDBFE",
    gold: "#D4AF6A",
  },
};

const esc = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

export type DetailRow = { label: string; value: string };

/**
 * Renders the shared institutional HTML shell every email uses: wordmark
 * header, headline, body content, optional CTA button, optional detail
 * table, and a footer with support contact + compliance disclaimer.
 * `includeUnsubscribe` should be false for security-critical mail
 * (password reset, signup confirmation).
 */
export function renderLayout(opts: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  details?: DetailRow[];
  ctaLabel?: string;
  ctaUrl?: string;
  includeUnsubscribe?: boolean;
}): string {
  const c = BRAND.colors;
  const detailsHtml = opts.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid ${c.border};border-radius:12px;overflow:hidden;">
        ${opts.details
          .map(
            (d, i) => `<tr style="background:${i % 2 === 0 ? c.panel : c.midnight};">
              <td style="padding:12px 16px;font-size:13px;color:${c.muted};font-family:'Space Grotesk',Arial,sans-serif;white-space:nowrap;">${esc(
                d.label
              )}</td>
              <td style="padding:12px 16px;font-size:13px;color:${c.ink};font-family:'Space Grotesk',Arial,sans-serif;text-align:right;font-weight:600;">${esc(
                d.value
              )}</td>
            </tr>`
          )
          .join("")}
      </table>`
    : "";

  const ctaHtml = opts.ctaLabel && opts.ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr><td style="border-radius:10px;background:linear-gradient(135deg, ${c.iceBlueStart}, ${c.iceBlueEnd});">
          <a href="${esc(opts.ctaUrl)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:'Space Grotesk',Arial,sans-serif;font-size:14px;font-weight:700;color:#0c0f18;text-decoration:none;border-radius:10px;">${esc(
        opts.ctaLabel
      )}</a>
        </td></tr>
      </table>`
    : "";

  const unsubscribeHtml = opts.includeUnsubscribe
    ? `<p style="margin:16px 0 0;font-size:11px;color:${c.muted};font-family:'Space Grotesk',Arial,sans-serif;">
        Manage your notification preferences by contacting <a href="mailto:${BRAND.supportEmail}" style="color:${c.muted};">${BRAND.supportEmail}</a>.
      </p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${c.midnight};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.midnight};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:${c.panel};border:1px solid ${c.border};border-radius:16px;overflow:hidden;">

        <!-- Header / wordmark -->
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid ${c.border};">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;height:32px;border-radius:8px;background:rgba(147,197,253,0.15);border:1px solid rgba(147,197,253,0.35);text-align:center;vertical-align:middle;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:15px;color:${c.iceBlueStart};">E</td>
            <td style="padding-left:10px;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:18px;letter-spacing:0.5px;color:${c.ink};">EMAX <span style="color:${c.gold};">INVEST</span></td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:${c.ink};">${esc(
    opts.heading
  )}</h1>
          <div style="font-family:'Space Grotesk',Arial,sans-serif;font-size:14px;line-height:1.65;color:${c.ink};">
            ${opts.bodyHtml}
          </div>
          ${detailsHtml}
          ${ctaHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px 28px;border-top:1px solid ${c.border};">
          <p style="margin:0 0 6px;font-size:12px;color:${c.muted};font-family:'Space Grotesk',Arial,sans-serif;">
            Questions? Contact us at <a href="mailto:${BRAND.supportEmail}" style="color:${c.iceBlueStart};">${BRAND.supportEmail}</a>.
          </p>
          <p style="margin:0;font-size:11px;color:${c.muted};font-family:'Space Grotesk',Arial,sans-serif;">${esc(
    BRAND.disclaimer
  )}</p>
          ${unsubscribeHtml}
          <p style="margin:16px 0 0;font-size:11px;color:${c.muted};font-family:'Space Grotesk',Arial,sans-serif;">© ${new Date().getFullYear()} EMAX Invest. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Sends an email via the Resend REST API. Never throws on send failure —
 * callers should decide whether a failed send should block anything (it
 * generally shouldn't block the underlying DB transaction, since these are
 * called async from webhooks after the write already happened).
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — skipping send:", opts.subject);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  if (!opts.to || (Array.isArray(opts.to) && opts.to.length === 0)) {
    console.error("sendEmail called with no recipient:", opts.subject);
    return { ok: false, error: "no recipient" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${BRAND.fromName} <${BRAND.fromAddress}>`,
        to: opts.to,
        reply_to: opts.replyTo || BRAND.replyTo,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Resend send failed", res.status, data);
      return { ok: false, error: `Resend ${res.status}: ${JSON.stringify(data)}` };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("Resend send threw", err);
    return { ok: false, error: String(err) };
  }
}

/** Best-effort display name: real name if we have one, else the part of the email before @. */
export function displayName(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim()) return name.trim();
  if (email) return email.split("@")[0];
  return "there";
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const n = Number(amount) || 0;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
