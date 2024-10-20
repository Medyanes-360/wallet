import bcrypt from "bcryptjs";

const DecryptPassword = async (LoginPassword, DbPassword) => {
  // LaginPassword: is the password user enters
  // DbPassword: if the user exists, then it's from db
  if (!LoginPassword || !DbPassword) {
    throw new Error("Password is empty");
  }

  // decrypt DbPassword and compare it to the user input
  const result = await bcrypt.compare(LoginPassword, DbPassword);
  if (!result) {
    throw new Error("Password is wrong");
  }

  return result;
};

export default DecryptPassword;
