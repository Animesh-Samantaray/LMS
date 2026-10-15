import nodemailer from "nodemailer";

/**
 * Validate and sanitize email environment variables without logging secrets.
 */
function validateCredentials() {
  const rawUser = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS;

  if (!rawUser || !rawPass) {
    const missing = [];
    if (!rawUser) missing.push("EMAIL_USER");
    if (!rawPass) missing.push("EMAIL_PASS");
    return {
      valid: false,
      reason: `Missing required environment variable(s): ${missing.join(", ")}`,
      user: "",
      pass: "",
    };
  }

  const user = rawUser.trim();
  // Strip any accidental spaces from Google 16-character app passwords
  const pass = rawPass.replace(/\s+/g, "");

  if (!user || !pass) {
    return {
      valid: false,
      reason: "EMAIL_USER or EMAIL_PASS is empty after trimming whitespace.",
      user: "",
      pass: "",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user)) {
    return {
      valid: false,
      reason: "EMAIL_USER does not match a valid email address format.",
      user: "",
      pass: "",
    };
  }

  return {
    valid: true,
    user,
    pass,
  };
}

/**
 * Categorize SMTP errors into actionable diagnostics without exposing credentials.
 */
function categorizeSmtpError(err, host, port) {
  if (!err) return "Unknown SMTP error";

  const msg = err.message || "";
  const code = err.code || "";
  const responseCode = err.responseCode;

  if (
    code === "EAUTH" ||
    responseCode === 535 ||
    msg.includes("Username and Password not accepted") ||
    msg.includes("Invalid login")
  ) {
    return "Authentication failed (EAUTH/535). Please verify that 2-Step Verification is active on the Gmail account and you are using a 16-character Google App Password (not your primary account password).";
  }

  if (
    code === "ETIMEDOUT" ||
    code === "ESOCKETTIMEDOUT" ||
    msg.toLowerCase().includes("timeout")
  ) {
    return `Connection timeout to ${host}:${port}. Network packets to the SMTP port were blocked or timed out. (Note: Render's Free tier blocks all outbound traffic on SMTP ports 25, 465, and 587 to prevent spam. Upgrading to a paid Render plan or using an HTTPS-based email API is required if deployed on Render Free tier).`;
  }

  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "EHOSTUNREACH"
  ) {
    return `Network error (${code}): Unable to reach ${host}:${port}. Check host and DNS resolution.`;
  }

  if (
    code === "ESOCKET" ||
    msg.includes("certificate") ||
    msg.includes("TLS") ||
    msg.includes("SSL")
  ) {
    return `TLS/STARTTLS negotiation failed: ${msg}.`;
  }

  return `${code ? `(${code}) ` : ""}${msg}`;
}

/**
 * Create a production-ready Nodemailer transporter.
 * Supports smtp.gmail.com on port 587 (STARTTLS, default) or port 465 (secure SSL).
 */
export const createMailTransporter = () => {
  const creds = validateCredentials();
  const smtpHost = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
  const smtpPort = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const isSecure =
    process.env.EMAIL_SECURE !== undefined
      ? process.env.EMAIL_SECURE === "true"
      : smtpPort === 465;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure, // false for port 587 (STARTTLS), true for port 465 (SSL)
    ...(isSecure ? {} : { requireTLS: true }),
    auth: {
      user: creds.user || undefined,
      pass: creds.pass || undefined,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
};

const transporter = createMailTransporter();



export const verifyTransporter = async () => {
  const creds = validateCredentials();
  if (!creds.valid) {
    console.warn(`[Nodemailer] Notice: ${creds.reason}`);
    return false;
  }

  const smtpHost = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
  const smtpPort = parseInt(process.env.EMAIL_PORT, 10) || 587;

  try {
    const timeoutMs = 8000;
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Connection timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);

    console.log(
      `[Nodemailer] Gmail SMTP transporter verified successfully (${smtpHost}:${smtpPort}). Ready to send emails.`
    );
    return true;
  } catch (err) {
    const diagnostic = categorizeSmtpError(err, smtpHost, smtpPort);
    console.warn(`[Nodemailer] Warning: Gmail SMTP connection check: ${diagnostic}`);
    return false;
  }
};


const sendMail = async ({ to, subject, html, text, attachments }) => {
  if (!to) {
    throw new Error("Recipient email address ('to') is required to send email");
  }

  const creds = validateCredentials();
  if (!creds.valid) {
    const errorMsg = `Email delivery aborted for ${to}: ${creds.reason}`;
    console.warn(`[Nodemailer] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const smtpHost = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
  const smtpPort = parseInt(process.env.EMAIL_PORT, 10) || 587;

  try {
    const mailOptions = {
      from: `"Shnoor LMS" <${creds.user}>`,
      to,
      subject,
      html,
      text,
      ...(attachments && Array.isArray(attachments) && attachments.length > 0
        ? { attachments }
        : {}),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Nodemailer] Email sent successfully to ${to} (MessageId: ${info.messageId})`
    );
    return info;
  } catch (error) {
    const diagnostic = categorizeSmtpError(error, smtpHost, smtpPort);
    console.error(`[Nodemailer] Failed to send email to ${to}:`, diagnostic);
    throw new Error(`Failed to send email: ${diagnostic}`);
  }
};

export default sendMail;