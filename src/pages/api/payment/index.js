import prisma from "../../../../prisma";
import hashPaymentData from "../../../services/hashPaymentData";
import logPaymentAttempt from "../../../services/logPaymentAttempt";
import {
  createNewData,
  getAllData,
  getUniqueData,
  updateDataByAny,
} from "../../../services/serviceOperations";
import { SUCCESS, FAILED } from "../../../constant";

const MAX_AMOUNT = 50000;
const MIN_AMOUNT = 250;

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

      // Check maximum allowed payment amount, if it excels the max amount, send an error message
      if (parsedAmount > MAX_AMOUNT) {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          `Maximum transaction amount exceeded (Limit: ${MAX_AMOUNT} TL)`
        );
        return res.status(403).json({
          status: "error",
          message: `Maximum transaction amount exceeded (Limit: ${MAX_AMOUNT} TL)`,
        });
      }

      // Check minimum allowed payment amount, if it fall short the min amount, send an error message
      if (parsedAmount < MIN_AMOUNT) {
        await logPaymentAttempt(
          userId,
          parsedAmount,
          transactionId,
          FAILED,
          `Minimum transaction amount (Minimum: ${MIN_AMOUNT} TL)`
        );
        return res.status(403).json({
          status: "error",
          message: `Minimum transaction amount (Minimum: ${MAX_AMOUNT} TL)`,
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

      // Perform the transaction atomically to avoid partial updates
      const deposit = await prisma.$transaction(async () => {
        // Record the transaction
        // const encryptedTransaction = hashPaymentData(newTransaction, "enc");
        const newTransaction = await createNewData("Transaction", {
          id: transactionId,
          userId,
          walletId: wallet.id,
          cardNumber,
          iban,
          type: "deposit",
          amount: parsedAmount,
          status: SUCCESS,
          description: description || "No description provided",
        });

        // Update the wallet balance safely
        const updatedWallet = await updateDataByAny(
          "Wallet",
          { id: wallet.id },
          {
            balance: {
              increment: parsedAmount, // Use Prisma's increment to avoid race conditions
            },
          }
        );

        // If everything is alright, make a log of the payment
        await logPaymentAttempt(
          userId,
          parsedAmount,
          newTransaction.id,
          SUCCESS,
          "Making a request for payment"
        );

        return { newTransaction, updatedWallet };
      });

      return res.status(200).json({
        status: "success",
        message: "yapılan işlem başarıyla tamamlandı.",
        data: deposit,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
};

export default handle;
