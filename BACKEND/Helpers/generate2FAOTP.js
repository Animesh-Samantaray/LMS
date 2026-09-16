import twoFAOtpTemplate from "../utils/twoFAOtpTemplate.js";
import { sendMail } from "../utils/sendMail.js";

const generate2FAOTP = async (user) => {
  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  user.twoFactorOTP = otp;

  user.twoFactorOTPExpire = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await user.save();

  await sendMail(
    user.email,
    "Your Two-Factor Authentication OTP",
    twoFAOtpTemplate(otp)
  );
};

export default generate2FAOTP;