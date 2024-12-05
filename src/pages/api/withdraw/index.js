import {
  createNewData,
  getUniqueData,
  getAllData,
} from "../../../services/serviceOperations";
import logPaymentAttempt from "../../../services/logPaymentAttempt";
import prisma from "../../../../prisma";
import hashPaymentData from "../../../services/hashPaymentData";
import { FAILED, PENDING } from "../../../constant";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // userId: to check whether the user exists or not
      // amount: to log the amount of money and make the process
      // transactionId: to idenify the payment process
      // description: is not necessary, but if a user desires, they can leave a description for the payment
      const paymentData = await req.body;
      // decrypted the encrypted retrieved data
      const decryptedData = hashPaymentData(paymentData, "dec");
      const { userId, amount, transactionId, description, cardNumber, iban } =
        decryptedData;
      // parse the amount to number which is string
      const parsedAmount = parseFloat(amount);

      // check the received data
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid userId or amount",
        });
      }

      // check the user data in db
      const user = await getUniqueData("User", { id: userId });
      if (!user) {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          "User not found"
        );
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // check the user role
      if (user.role && user.role === "ADMIN") {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          "The action cannot be performed"
        );
        return res.status(403).json({
          status: "error",
          message: "The action cannot be performed",
        });
      }

      // Fetch logs made for payment attempts made by the user today
      const todayPaymentLogs = await getAllData("PaymentLog", {
        userId: user.id,
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
          lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
        },
      });

      //? Çünkü max günlük işlem sayısında başarısız işlemleri de saymalıyız
      // Check daily payment limit, if it's more than the user can make in one day, we send an error
      if (
        todayPaymentLogs &&
        todayPaymentLogs.length >= user.dailyPaymentLimit
      ) {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          "Daily payment limit exceeded"
        );
        return res.status(403).json({
          status: "error",
          message: "Daily payment limit exceeded.",
        });
      }

      // Find the user's wallet
      const wallet = await getUniqueData("Wallet", { userId });
      if (!wallet) {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          `Wallet not found for the user`
        );
        return res.status(404).json({
          status: "error",
          message: "Wallet not found for the user",
        });
      }
      // Ensure the wallet has enough funds to cover the requested amount
      if (parsedAmount > wallet.balance) {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          `Insufficient funds in wallet`
        );
        return res.status(400).json({
          status: "error",
          message: "Insufficient funds in wallet",
        });
      }

      const withdraw = await prisma.$transaction(async () => {
        // Record the transaction
        const newTransaction = await createNewData("Transaction", {
          id: transactionId,
          userId,
          walletId: wallet.id,
          cardNumber,
          iban,
          type: "withdraw",
          amount: parsedAmount,
          status: PENDING,
          description: description || "Money withdrawal",
        });

        await logPaymentAttempt(
          userId,
          parsedAmount,
          newTransaction.id,
          PENDING,
          "Withdraw request made"
        );

        return newTransaction;
      });

      return res.status(200).json({
        status: "success",
        message: "yapılan sorgu başarıyla gönderildi.",
        data: { withdraw },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error,
      });
    }
  } else {
    return res.status(405).json({
      status: "error",
      message: "Method Not Allowed",
    });
  }
};

export default handle;
