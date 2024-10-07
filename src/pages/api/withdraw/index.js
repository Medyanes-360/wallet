import prisma from "../../../../prisma";
import { validateWithdrawMiddleware } from "../../../middleware/validateWithdrawMiddleware";
import logPaymentAttempt from "../../../services/logPaymentAttempt";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const middlewareResponse = await validateWithdrawMiddleware(req);

      if (!middlewareResponse.ok) {
        const middlewareResponseBody = await middlewareResponse.json();
        return res.status(middlewareResponse.status).json({
          status: "error",
          message: middlewareResponseBody.message,
        });
      }

      // If the middleware passes, proceed with payment logic
      const { userId, amount, description } = await req.body;

      //? DO WE NEED THIS CHECK?
      // if (!userId || !amount || amount <= 0) {
      //   return res.status(400).json({
      //     status: "error",
      //     message: "Invalid userId or amount",
      //   });
      // }

      // Find the relevant wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      //? DO WE NEED THIS CHECK?
      // if (!wallet) {
      //   return res.status(404).json({
      //     status: "error",
      //     message: "Wallet not found for the user",
      //   });
      // }

      const result = await prisma.$transaction(async (prisma) => {
        // Record the transaction
        const newTransaction = await prisma.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: "withdraw",
            amount,
            status: "PENDING",
            description: description || "Payment transaction",
          },
        });

        const updatedWallet = await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        const logThePayment = await logPaymentAttempt(
          userId,
          amount,
          newTransaction.id,
          "PENDING"
        );

        return { newTransaction, updatedWallet, logThePayment };
      });

      return res.status(200).json({
        status: "success",
        message: `API request succeeded`,
        transaction: result,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", error: `API CATCH ERROR: ${error.message}` });
    }
  }
};

export default handle;
