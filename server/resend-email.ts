import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export type EmailSignatureType = "hr" | "support" | "default";

function getSignatureBlock(type: EmailSignatureType): string {
  if (type === "hr") {
    return `<p style="margin:0 0 4px;font-size:14px;color:#333;font-weight:700;">Warm Regards,</p>
                    <p style="margin:0 0 2px;font-size:14px;color:#C41E3A;font-weight:700;">HR Department</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#666;font-weight:600;">MetaEdge Creatives</p>`;
  }
  if (type === "support") {
    return `<p style="margin:0 0 4px;font-size:14px;color:#333;font-weight:700;">Warm Regards,</p>
                    <p style="margin:0 0 2px;font-size:14px;color:#C41E3A;font-weight:700;">Customer Support</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#666;font-weight:600;">MetaEdge Creatives</p>`;
  }
  return `<p style="margin:0 0 4px;font-size:14px;color:#333;font-weight:700;">Warm Regards,</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#666;font-weight:600;">MetaEdge Creatives</p>`;
}

function wrapInTemplate(htmlContent: string, signatureType: EmailSignatureType = "default"): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f1ee;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ee;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background:linear-gradient(135deg, #C41E3A 0%, #8B1528 100%);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:1px;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">MetaEdge Creatives</h1>
            </td>
          </tr>

          <tr>
            <td style="height:4px;background:linear-gradient(90deg, #C41E3A 0%, #ff6b6b 50%, #C41E3A 100%);"></td>
          </tr>

          <tr>
            <td style="padding:36px 40px 28px;">
              ${htmlContent}
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg, #fdf2f4 0%, #fff5f6 100%);border-radius:10px;padding:20px 24px;border:1px solid #fce4e8;">
                    ${getSignatureBlock(signatureType)}
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 0 4px;">
                          <a href="mailto:info@metaedgecreatives.com" style="color:#C41E3A;text-decoration:none;font-size:13px;font-weight:500;">&#9993; info@metaedgecreatives.com</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a href="tel:+923335063129" style="color:#C41E3A;text-decoration:none;font-size:13px;font-weight:500;">&#9742; +92 333 5063129</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #eee;padding:18px 0;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#999;letter-spacing:0.5px;text-transform:uppercase;">Connect With Us</p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="padding:0 6px;">
                          <a href="https://metaedgecreatives.com" style="display:inline-block;background:#C41E3A;color:#fff;text-decoration:none;font-size:11px;padding:6px 14px;border-radius:20px;font-weight:600;">Visit Website</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.5px;">MetaEdge Creatives</p>
              <p style="margin:0 0 4px;color:#aaa;font-size:11px;">&copy; ${new Date().getFullYear()} MetaEdge Creatives. All rights reserved.</p>
              <p style="margin:0 0 4px;color:#888;font-size:11px;">312 W 2nd St Unit #A8985 Casper, WY 82601</p>
              <p style="margin:0;color:#666;font-size:11px;">
                <a href="https://metaedgecreatives.com" style="color:#C41E3A;text-decoration:none;">metaedgecreatives.com</a>
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

export async function sendNotificationEmail(subject: string, htmlContent: string, signatureType: EmailSignatureType = "default") {
  const client = getResendClient();
  if (!client) {
    console.log("Resend API key not configured, skipping email:", subject);
    return;
  }
  try {
    await client.emails.send({
      from: "MetaEdge Creatives <info@metaedgecreatives.com>",
      to: "info@metaedgecreatives.com",
      subject,
      html: wrapInTemplate(htmlContent, signatureType),
    });
    console.log("Email sent successfully:", subject);
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

export async function sendEmailTo(to: string, subject: string, htmlContent: string, signatureType: EmailSignatureType = "default") {
  const client = getResendClient();
  if (!client) {
    console.log("Resend API key not configured, skipping email to:", to);
    return;
  }
  try {
    await client.emails.send({
      from: "MetaEdge Creatives <info@metaedgecreatives.com>",
      to,
      subject,
      html: wrapInTemplate(htmlContent, signatureType),
    });
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
