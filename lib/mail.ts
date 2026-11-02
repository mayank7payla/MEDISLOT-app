import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) { console.log(`[mail skipped - SMTP not set] ${to}: ${subject}`); return; }
  try { await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, text }); }
  catch (e) { console.error("mail failed", e); }
}

export const fmt = (d: Date) =>
  d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
