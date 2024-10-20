import prisma from "../../../../prisma";
import logPaymentAttempt from "../../../services/logPaymentAttempt";
import {
  createNewData,
  getAllData,
  getUniqueData,
  updateDataByAny,
} from "../../../services/serviceOperations";

const MAX_AMOUNT = 50000;
const MIN_AMOUNT = 250;

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { userId, amount, transactionId, description } = await req.body;

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
          amount,
          transactionId,
          "FAILURE",
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
          amount,
          transactionId,
          "FAILURE",
          "Admins cannot perform this action"
        );
        return res.status(403).json({
          status: "error",
          message: "Admins are not allowed to perform this action",
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

      // Check daily payment limit
      if (todayPaymentLogs.length >= user.dailyPaymentLimit) {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "FAILURE",
          "Daily payment limit exceeded"
        );
        return res.status(403).json({
          status: "error",
          message: "Daily payment limit exceeded.",
        });
      }

      // Check maximum allowed payment amount
      if (amount > MAX_AMOUNT) {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "FAILURE",
          `Maximum transaction amount exceeded (Limit: ${MAX_AMOUNT} TL)`
        );
        return res.status(403).json({
          status: "error",
          message: `Maximum transaction amount exceeded (Limit: ${MAX_AMOUNT} TL)`,
        });
      }

      // Check minimum allowed payment amount
      if (amount < MIN_AMOUNT) {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "FAILURE",
          `Minimum transaction amount (Minimum: ${MIN_AMOUNT} TL)`
        );
        return res.status(403).json({
          status: "error",
          message: `Minimum transaction amount (Minimum: ${MAX_AMOUNT} TL)`,
        });
      }

      // Find the relevant wallet
      const wallet = await getUniqueData("Wallet", { userId });

      if (!wallet) {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "FAILURE",
          `Wallet not found for the user`
        );
        return res.status(404).json({
          status: "error",
          message: "Wallet not found for the user",
        });
      }

      // Perform the transaction atomically to avoid partial updates
      const result = await prisma.$transaction(async () => {
        // await updateDataByAny(
        //   "User",
        //   { id: user.id },
        //   { walletProcessing: true }
        // );

        // Record the transaction
        const newTransaction = await createNewData("Transaction", {
          id: transactionId,
          userId,
          walletId: wallet.id,
          type: "payment",
          amount,
          status: "PENDING",
          description: description || "Payment transaction",
        });

        // Update the wallet balance safely
        const updatedWallet = await updateDataByAny(
          "Wallet",
          { id: wallet.id },
          {
            balance: {
              increment: amount, // Use Prisma's increment to avoid race conditions
            },
          }
        );

        // If everything is alright, make a log of the payment
        await logPaymentAttempt(
          userId,
          amount,
          newTransaction.id,
          "SUCCESS",
          "Making a request for payment"
        );

        // await updateDataByAny(
        //   "User",
        //   { id: user.id },
        //   { walletProcessing: false }
        // );

        return { newTransaction, updatedWallet };
      });

      return res.status(200).json({
        status: "success",
        message: "API request succeeded",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `API CATCH ERROR: ${error.message}`,
      });
    }
  }
};

export default handle;
