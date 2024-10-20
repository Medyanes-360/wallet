import bcrypt from "bcryptjs";

const EncryptPassword = async (password) => {
  try {
    if (!password) throw new Error("Error: Password is empty");
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // hashing password using salt method to make it even harder to be hacked
    return hashedPassword;
  } catch (error) {
    return { error };
  }
};

export default EncryptPassword;
