import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";

const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});


export const verifyTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Nodemailer] Notice: EMAIL_USER or EMAIL_PASS environment variable is not set.");
    return false;
  }
  try {
    await transporter.verify();
    console.log("[Nodemailer] Gmail SMTP transporter connected successfully.");
    return true;
  } catch (err) {
    console.warn(`[Nodemailer] Warning: Gmail SMTP connection check: ${err.message}`);
    return false;
  }
};


const sendMail = async ({ to, subject, html, text, attachments }) => {
  if (!to) {
    throw new Error("Recipient email address ('to') is required to send email");
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[Nodemailer] EMAIL_USER or EMAIL_PASS not set. Skipping email to: ${to}`);
    return null;
  }

  try {
    const mailOptions = {
      from: `"Shnoor LMS" <${process.env.EMAIL_USER.trim()}>`,
      to,
      subject,
      html,
      text,
      ...(attachments && Array.isArray(attachments) && attachments.length > 0 ? { attachments } : {}),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Nodemailer] Failed to send email to ${to}:`, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendMail;