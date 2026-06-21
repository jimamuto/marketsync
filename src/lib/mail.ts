import nodemailer from "nodemailer";
const smtpPort = Number(process.env.SMTP_PORT ?? 465);

export const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type sendMailOptions = {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: sendMailOptions) {
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP user is not configured");
  }

  return mailTransporter.sendMail({
    from: `"MarketSync" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

