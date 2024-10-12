import jwt from "jsonwebtoken";

export const generateJwtToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5m" });
