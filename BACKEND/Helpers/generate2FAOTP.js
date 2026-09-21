import crypto from "crypto";

const generate2FAOTP = () => {
  const otp = crypto.randomInt(100000, 1000000).toString();

};

export default generate2FAOTP;