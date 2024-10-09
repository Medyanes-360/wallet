import { getUniqueData } from "../../../../services/serviceOperations";
import logPaymentAttempt from "../../../../services/logPaymentAttempt";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { userId, amount, paymentType } = await req.body;
      const senderNumber = process.env.SMS_SENDER_PHONE_NUMBER;

      if (!userId || !amount || !paymentType) {
        return res.status(400).json({
          status: "error",
          message: "Invalid userId, amount or paymentType",
        });
      }

      // check the user data in db
      const user = await getUniqueData("User", { id: userId });
      if (!user) {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "FAILURE",
          "User not found"
        );
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      const sendSMS = () => {
        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const body = `Your verification code for ${paymentType} for the amount of ${amount} is: ${verificationCode}`;

        return {
          verificationCode,
          message: body,
          from: senderNumber,
          to: user.phoneNumber,
        };
      };

      const smsResponse = sendSMS();

      return res.status(200).json({
        status: "success",
        message: smsResponse,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error,
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: "error", message: "Method Not Allowed" });
  }
};

export default handle;
