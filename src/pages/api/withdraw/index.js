import {
  createNewData,
  getUniqueData,
} from "../../../services/serviceOperations";
import logPaymentAttempt from "../../../services/logPaymentAttempt";

const PENDING = "PENDING";
const FAILURE = "FAILURE";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // userId: to check whether the user exists or not
      // amount: to log the amount of money and make the process
      // transactionId: to idenify the payment process
      // description: is not necessary, but if a user desires, they can leave a description for the payment
      const { userId, amount, transactionId, description } = await req.body;

      // check the received data
      if (!userId || amount <= 0 || !amount) {
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
          FAILURE,
          "User not found"
        );
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // check the user role
      if (user.role && user.role === "ADMIN") {
        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          FAILURE,
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
      // Check daily payment limit
      if (todayPaymentLogs.length >= user.dailyPaymentLimit) {
        await logPaymentAttempt(
          user.id,
          amount,
          transactionId,
          FAILURE,
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
          amount,
          transactionId,
          FAILURE,
          `Wallet not found for the user`
        );
        return res.status(404).json({
          status: "error",
          message: "Wallet not found for the user",
        });
      }

      const withdraw = await prisma.$transaction(async () => {
        // Record the transaction
        const newTransaction = await createNewData("Transaction", {
          id: transactionId,
          userId,
          wallet: wallet.id,
          type: "withdraw",
          amount,
          status: PENDING,
          description: description || "Money withdrawal",
        });

        await logPaymentAttempt(
          userId,
          amount,
          transactionId,
          PENDING,
          "Withdraw request made"
        );

        return newTransaction;
      });

      return res.status(200).json({
        status: "success",
        message: "yapılan sorgu başarıyla gönderildi.",
        data: {
          withdraw,
          //? Gotta decide who admin should get withdraw req. from DB or as an API req?
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
