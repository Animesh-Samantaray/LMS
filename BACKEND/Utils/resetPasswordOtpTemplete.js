const resetPasswordTemplate = (otp) => {
  return `
    <div style="background-color: #f4f6f8; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; min-height: 100%; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eef2f5;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Learning Management System
          </h2>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; text-align: center;">

          <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 10px; font-size: 22px;">
            Password Reset Request
          </h3>

          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your account password.
            Use the One-Time Password (OTP) below to continue.
          </p>

          <!-- OTP Box -->
          <div style="background:#eff6ff; border:2px dashed #2563eb; border-radius:8px; display:inline-block; padding:18px 25px; letter-spacing:8px; margin-bottom:30px;">
            <span style="font-size:34px; font-weight:bold; color:#1d4ed8; font-family:'Courier New', monospace;">
              ${otp}
            </span>
          </div>

          <!-- Expiry -->
          <div style="background:#fef3c7; color:#92400e; display:inline-block; padding:10px 18px; border-radius:6px; font-size:13px; font-weight:500;">
            ⏳ This OTP is valid for <strong>10 minutes</strong>.
          </div>

          <p style="margin-top:30px; color:#6b7280; font-size:14px; line-height:1.6;">
            Enter this OTP in the password reset page to create a new password.
          </p>

          <p style="margin-top:20px; color:#9ca3af; font-size:13px; border-top:1px solid #f3f4f6; padding-top:20px;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will remain unchanged and no further action is required.
          </p>

        </div>

        <!-- Footer -->
        <div style="background:#fafafa; border-top:1px solid #f3f4f6; padding:20px; text-align:center;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} Learning Management System
            All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  `;
};

export default resetPasswordTemplate;