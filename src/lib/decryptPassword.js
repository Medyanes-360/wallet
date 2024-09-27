import bcrypt from "bcryptjs";

const DecryptPassword = async (LoginPassword, DbPassword) => {
  if (!LoginPassword || !DbPassword) {
    throw new Error("Password is empty");
  }

  const result = await bcrypt.compare(LoginPassword, DbPassword);
  if (!result) {
    throw new Error("Password is wrong");
  }

  return result;
};

export default DecryptPassword;
