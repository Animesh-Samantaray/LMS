import bcrypt from 'bcryptjs';

export const hashPassword = async(password)=>{
    const pass = await bcrypt.hash(password , 10);
    return pass;
}

export const comparePassword = async (
  enteredPassword,
  storedPassword
) => {
  return await bcrypt.compare(
    enteredPassword,
    storedPassword
  );
};
