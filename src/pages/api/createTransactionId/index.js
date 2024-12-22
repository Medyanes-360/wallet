import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { userId, amount } = req.body;

    // Create the transaction ID using the JWT on the server-side
    const transactionId = jwt.sign(
      { userId, transactionId: uuidv4(), amount },
      process.env.SECRET_PAYMENT_KEY // The secret key stays on the server
    );

    return res.status(200).json({ status: "success", data: transactionId });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
