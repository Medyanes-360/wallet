import {
  createNewData,
  getUniqueData,
} from "../../../services/serviceOperations";
import logPaymentAttempt from "../../../services/logPaymentAttempt";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { userId, userIp, transactionId, amount, description } =
        await req.body;

      if (!userId || !userIp || amount <= 0 || !amount) {
        return res.status(400).json({
          status: "error",
          message: "Invalid userId, userIp or amount",
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
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // check the user ip in db
      const checkUserIp = await getUniqueData("ipWhitelist", {
        userId,
        ipAddress: userIp,
      });
      if (!checkUserIp) {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "FAILURE",
          "User IP not found"
        );
        return res.status(404).json({
          status: "error",
          message: "User IP not found",
        });
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

      const transaction = await prisma.$transaction(async () => {
        // Record the transaction
        const newTransaction = await createNewData("Transaction", {
          id: transactionId,
          userId,
          wallet: wallet.id,
          type: "withdraw",
          amount,
          status: "PENDING",
          description: description || "Money withdrawal",
        });

        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          "PENDING",
          "Withdraw request made"
        );

        return newTransaction;
      });

      return res.status(200).json({
        status: "success",
        message: "API request succeedeed",
        data: {
          transaction,
          isVerified: true,
        },
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
