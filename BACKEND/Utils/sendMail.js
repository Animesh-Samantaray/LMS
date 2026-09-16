import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"LMS Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}`);

    return info;
  } catch (error) {
    console.error("Email Sending Error:", error.message);
    throw new Error("Failed to send email");
  }
};

export default sendMail;