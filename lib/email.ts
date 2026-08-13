// lib/email.ts
// Password-reset OTP delivery. No email utility existed in the project
// yet, so this adds one nodemailer transporter, configured entirely
// from environment variables (never hardcoded), following the same
// "read from process.env, throw a clear error if missing" pattern as
// lib/mongodb.ts and lib/jwt.ts.
//
// Required environment variables (add to .env.local):
//   SMTP_HOST   - e.g. smtp.gmail.com, smtp.sendgrid.net
//   SMTP_PORT   - e.g. 587 (STARTTLS) or 465 (TLS)
//   SMTP_USER   - SMTP auth username
//   SMTP_PASS   - SMTP auth password / API key
// Optional:
//   SMTP_FROM   - display "From" address, defaults to SMTP_USER
import nodemailer, { type Transporter } from "nodemailer";
import path from "path";
import fs from "fs";
import { OTP_EXPIRY_MINUTES } from "@/lib/otp";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env file to enable password-reset emails."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

/**
 * Sends the password-reset OTP to the given email. Callers must pass
 * the raw OTP here (never persisted) — this function does not log it
 * or include it in any response, only in the outgoing email body.
 */
export async function sendPasswordResetOtpEmail(
  to: string,
  otp: string
): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  // Prefer high-res PNG for crisp rendering, fallback to SVG
  const pngLogoPath = path.join(process.cwd(), "public/assets/logo/oasys-mark.png");
  const svgLogoPath = path.join(process.cwd(), "public/assets/logo/oasys-mark.svg");
  
  const attachments: Array<{ filename: string; path: string; cid: string }> = [];
  let logoCid: string | null = null;

  if (fs.existsSync(pngLogoPath)) {
    logoCid = "oasys-logo-mark";
    attachments.push({
      filename: "oasys-mark.png",
      path: pngLogoPath,
      cid: logoCid,
    });
  } else if (fs.existsSync(svgLogoPath)) {
    logoCid = "oasys-logo-mark";
    attachments.push({
      filename: "oasys-mark.svg",
      path: svgLogoPath,
      cid: logoCid,
    });
  }

  // TEMPORARY DEBUG: verify the SMTP connection/authentication before
  // sending, and log only non-sensitive delivery-result fields after
  // sendMail. Remove once delivery is confirmed working.
  try {
    const verifyResult = await transporter.verify();
    console.log("SMTP VERIFY:", verifyResult);
  } catch (verifyError) {
    console.log("SMTP VERIFY FAILED:", verifyError);
  }

  // Clean logo container without border
  const logoHeaderHtml = logoCid
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
        <tr>
          <td align="center" valign="middle" bgcolor="#ffffff" style="background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff); padding: 12px 24px; border-radius: 12px;">
            <img class="logo-img" src="cid:${logoCid}" alt="OASYS Logo" width="160" style="display: block; width: 160px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none; margin: 0 auto; -ms-interpolation-mode: bicubic;" />
          </td>
        </tr>
      </table>
    `
    : `<div style="width: 56px; height: 56px; background-color: #6D28D9; border-radius: 50%; color: #ffffff; font-weight: 800; font-size: 24px; line-height: 56px; text-align: center; font-family: Arial, sans-serif; margin: 0 auto;">O</div>`;

  const info = await transporter.sendMail({
    from: `OASYS Hostel Management <${from}>`,
    to,
    subject: "Your OASYS password reset code",
    text: `Your OASYS password reset OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can safely ignore this email.`,
    attachments,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OASYS Password Reset Email</title>
        <style>
          /* Mobile Responsive Styles */
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 12px !important;
            }
            .content-padding {
              padding: 20px 16px 20px 16px !important;
            }
            .logo-img {
              width: 140px !important;
              height: auto !important;
            }
            .otp-text {
              font-size: 28px !important;
              letter-spacing: 6px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F3F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F4F3F8; padding: 16px 8px;">
          <tr>
            <td align="center">
              <!-- Main Email Container -->
              <table class="email-container" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 460px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                
                <!-- Top Accent Bar -->
                <tr>
                  <td style="height: 5px; background-color: #6D28D9;"></td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td class="content-padding" style="padding: 24px 24px 20px 24px;">
                    
                    <!-- Header Logo without outer border -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="center" valign="middle">
                          ${logoHeaderHtml}
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <div style="height: 1px; background-color: #F3F4F6; margin-bottom: 20px;"></div>

                    <!-- Title & Intro -->
                    <h1 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.01em; text-align: center;">Password Reset Request</h1>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #4B5563; text-align: left;">
                      We received a request to reset the password for your <strong>OASYS Hostel Management</strong> account.
                    </p>

                    <!-- OTP Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                      <tr>
                        <td style="padding: 18px 14px;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6D28D9; margin-bottom: 6px;">
                            Your Verification Code
                          </div>
                          
                          <!-- Code -->
                          <div class="otp-text" style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4C1D95; margin: 6px 0 12px 8px;">
                            ${otp}
                          </div>

                          <!-- Expiry Tag -->
                          <div style="display: inline-block; background-color: #EDE9FE; border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: #5B21B6;">
                            This code expires in ${OTP_EXPIRY_MINUTES} minutes
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Security Callout -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; border-left: 3px solid #9CA3AF; border-radius: 4px; margin-bottom: 4px;">
                      <tr>
                        <td style="padding: 10px 12px; font-size: 13px; line-height: 1.4; color: #6B7280;">
                          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF9FC; border-top: 1px solid #F3F4F6; padding: 16px 20px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 2px;">
                      OASYS Institute of Technology
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #6D28D9; margin-bottom: 8px;">
                      Hostel Management System
                    </div>
                    <div style="font-size: 11px; color: #9CA3AF; line-height: 1.4;">
                      This is an automated email. Please do not reply.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `,
  });

  console.log("SMTP RESULT:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    envelope: info.envelope,
  });
}