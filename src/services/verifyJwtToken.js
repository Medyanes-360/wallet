import jwt from "jsonwebtoken";

export const verifyJwtToken = (token) => {
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    return decode
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
