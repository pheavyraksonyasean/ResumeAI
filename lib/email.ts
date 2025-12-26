import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm your signup</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #000;
            color: #fff;
            padding: 40px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #18181b;
            border-radius: 12px;
            padding: 40px;
          }
          h2 {
            color: #22c55e;
            margin-bottom: 20px;
          }
          p {
            color: #a1a1aa;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #22c55e;
            color: #000 !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #16a34a;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #71717a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Confirm your signup</h2>
          <p>Thanks for signing up for ResumeAI! Please confirm your email address by clicking the button below:</p>
          <p><a href="${confirmationUrl}" class="button">Confirm your email</a></p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #22c55e;">${confirmationUrl}</p>
          <p class="footer">
            If you didn't create an account with ResumeAI, you can safely ignore this email.
            <br><br>
            This link will expire in 24 hours.
          </p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"ResumeAI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Confirm your ResumeAI signup",
    html: htmlContent,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset your password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #000;
            color: #fff;
            padding: 40px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #18181b;
            border-radius: 12px;
            padding: 40px;
          }
          h2 {
            color: #22c55e;
            margin-bottom: 20px;
          }
          p {
            color: #a1a1aa;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #22c55e;
            color: #000 !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #71717a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset your password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p><a href="${resetUrl}" class="button">Reset Password</a></p>
          <p class="footer">
            If you didn't request a password reset, you can safely ignore this email.
            <br><br>
            This link will expire in 1 hour.
          </p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"ResumeAI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your ResumeAI password",
    html: htmlContent,
  });
}
