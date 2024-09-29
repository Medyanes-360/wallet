import prisma from "../../prisma";
import sendEmail from "./sendEmail";
import logPaymentAttempt from "./logPaymentAttempt";

const LIMIT = 2000;

const validateLargeAmount = async (userId, amount, method) => {
  if (amount > LIMIT) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        await logPaymentAttempt(userId, amount, "User not found");
        throw new Error("User not found");
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      const smsMessage = `Hello,\n\nYour verification code for the transaction of ${amount} is: ${verificationCode}.\n\nThank You!`;
      const emailMessage = `
                      <h1>Hello!</h1>
                      <p>Your verification code for the transaction of ${amount} is:</p>
                      <strong>${verificationCode}</strong>
                      <p>Thank you!</p>
                    `;

      if (method === "sms") {
        await sendSMS(user.phoneNumber, smsMessage);
      } else {
        await sendEmail(
          user.email,
          "Ofistik: Your Verification Code",
          emailMessage
        );
      }

      return { status: "success", message: "Verification sent successfully" };
    } catch (error) {
      //? Do we actually need to long here as well?
      await logPaymentAttempt(userId, amount, error.message);
      return { status: "failure", message: error.message };
    }
  } else {
    return { status: "success", message: "No verification needed" };
  }
};

export default validateLargeAmount;
