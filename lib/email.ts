import { Resend } from 'resend';

/**
 * Shared Resend client utility
 */
export const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set. Email functionality will be disabled.");
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Standard 'from' email address configuration
 */
export const getFromEmail = () => {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
};

/**
 * Standard display name for emails
 */
export const getFromDisplayName = () => {
  return process.env.RESEND_FROM_NAME || 'दिपशिखा सहकारी';
};

/**
 * Helper to send email with error handling and consistent 'from' address
 */
export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("Email service not configured (RESEND_API_KEY missing)");
  }

  const sender = from || `${getFromDisplayName()} <${getFromEmail()}>`;

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      
      // Provide more helpful error messages for common Resend restrictions
      if (error.message?.includes("testing emails") || error.message?.includes("not verified")) {
        throw new Error(
          `Resend Restriction: ${error.message}. ` +
          "To send to external recipients, you must verify your domain at resend.com/domains " +
          "and update RESEND_FROM_EMAIL in your .env.local."
        );
      }
      
      throw new Error(error.message || "Failed to send email via Resend");
    }

    return data;
  } catch (err: any) {
    console.error("Email send catch error:", err);
    throw err;
  }
}
