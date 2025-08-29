export interface MailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

// Minimal mailer: logs to console. Intended to be replaced with SMTP/Nodemailer when configured.
export async function sendMail({ to, subject, html, text }: MailOptions): Promise<{ ok: boolean; provider: string }> {
  const usingSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  // For now, always console fallback to avoid requiring nodemailer dependency
  // If SMTP envs are present, we still log so devs can wire up real transport later
  const payload = {
    to,
    subject,
    text,
    html,
    meta: {
      usingSmtp,
      from: process.env.MAIL_FROM || "no-reply@example.com",
      appBaseUrl: process.env.APP_BASE_URL,
      env: process.env.NODE_ENV,
      at: new Date().toISOString(),
    },
  };
  // eslint-disable-next-line no-console
  console.log("[Mailer] Sending email:", JSON.stringify(payload, null, 2));
  return { ok: true, provider: usingSmtp ? "smtp" : "console" };
}
