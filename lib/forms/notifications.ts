import { db } from "@/db";
import { notifications } from "@/db/forms-schema";
import { sendEmail } from "@/lib/email";

export type NotificationType =
  | "submission_created"
  | "submission_approved"
  | "submission_rejected"
  | "submission_returned"
  | "submission_completed"
  | "new_submission"  // admin notification
  | "reminder";

interface NotifyOptions {
  userId: string;
  userType: "member" | "admin";
  type: NotificationType;
  title: string;
  message?: string;
  payload?: Record<string, string>;
  link?: string;
  /** If set, also sends an email to this address */
  email?: string;
}

export async function createNotification(opts: NotifyOptions) {
  try {
    // Insert in-app notification
    await db.insert(notifications).values({
      memberId: opts.userType === "member" ? opts.userId : null,
      adminId: opts.userType === "admin" ? opts.userId : null,
      type: opts.type,
      title: opts.title,
      message: opts.message ?? null,
      payloadJson: opts.payload ?? null,
      link: opts.link ?? null,
    });

    // Optionally send email
    if (opts.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dps-site-w47q.vercel.app";
      const linkUrl = opts.link ? `${appUrl}${opts.link}` : appUrl;

      await sendEmail({
        to: opts.email,
        subject: opts.title,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <div style="background:#166534;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0;font-size:20px">दिपशिखा कृषि सहकारी संस्था</h1>
            </div>
            <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <h2 style="color:#1f2937">${opts.title}</h2>
              ${opts.message ? `<p style="color:#4b5563">${opts.message}</p>` : ""}
              <div style="text-align:center;margin:24px 0">
                <a href="${linkUrl}" style="background:#166534;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block">
                  View Details →
                </a>
              </div>
              <p style="color:#6b7280;font-size:12px;text-align:center">
                Dipshikha Krishi Sahakari Sanstha — Member Portal
              </p>
            </div>
          </div>
        `,
      }).catch((err) => console.error("[notify] Email failed:", err));
    }
  } catch (err) {
    console.error("[notify] Failed to create notification:", err);
  }
}
