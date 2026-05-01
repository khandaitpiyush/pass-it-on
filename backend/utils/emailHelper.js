// utils/emailHelper.js

/**
 * Send email using Brevo SMTP API
 * @param {Object} options
 * @param {string} options.to
 * @param {string} [options.toName]
 * @param {string} options.subject
 * @param {string} options.htmlContent
 * @param {string} [options.textContent]
 */
export async function sendEmail(options) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "PassItOn";

  if (!apiKey) throw new Error("BREVO_API_KEY is not configured.");
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL is not configured.");

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: options.to, name: options.toName }],
    subject: options.subject,
    htmlContent: options.htmlContent,
    ...(options.textContent && { textContent: options.textContent }),
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch (_) {}

    throw new Error(
      `Brevo API error ${response.status}: ${
        errorBody?.message || response.statusText
      }`
    );
  }
}

/**
 * Build OTP email HTML
 * @param {string} otp
 * @param {string} userName
 * @returns {string}
 */
export function buildOtpEmailHtml(otp, userName) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your college email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                🎓 PassItOn
              </p>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">
                Campus Marketplace
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
                Verify your college email
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                Hi <strong>${userName}</strong>, use the code below to verify your college email
                and unlock seller privileges on PassItOn.
              </p>

              <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;
                          padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#16a34a;
                           letter-spacing:2px;text-transform:uppercase;">
                  Your verification code
                </p>
                <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;
                           color:#111827;font-family:'Courier New',monospace;">
                  ${otp}
                </p>
                <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">
                  Expires in <strong>10 minutes</strong>
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                If you didn't request this, you can safely ignore this email.
                Never share this code with anyone.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;
                       text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} PassItOn · Campus marketplace for students
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}