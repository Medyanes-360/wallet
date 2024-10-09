import logPaymentAttempt from "../../../services/logPaymentAttempt";
import {
  createNewData,
  getAllData,
  getUniqueData,
  updateDataByAny,
} from "../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const {
        senderUserId,
        receiverUserId,
        senderUserIp,
        amount,
        requiredAmount,
        transactionId,
        description,
      } = await req.body;

      // check the received data
      if (
        !senderUserId ||
        !receiverUserId ||
        !senderUserIp ||
        !amount ||
        amount <= 0
      ) {
        return res.status(400).json({
          status: "error",
          message: "Something went wrong",
        });
      }

      const [senderUser, receiverUser] = await Promise.all([
        getUniqueData("User", { id: senderUserId }),
        getUniqueData("User", { id: receiverUserId }),
      ]);

      if (!senderUser || !receiverUser) {
        const missingUserId = !senderUser ? senderUserId : receiverUserId;
        const missingUserMessage = !senderUser
          ? "senderUser not found"
          : "receiverUser not found";
        await logPaymentAttempt(
          missingUserId,
          amount,
          transactionId,
          "FAILURE",
          missingUserMessage
        );

        return res.status(404).json({
          status: "error",
          message: missingUserMessage,
        });
      }

      // check the user ip in db
      const checkUserIp = await getUniqueData("IpWhitelist", {
        userId: senderUser.id,
        ipAddress: senderUserIp,
      });
      if (!checkUserIp) {
        await logPaymentAttempt(
          senderUser.id,
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
      if (senderUser.role && senderUser.role === "ADMIN") {
        await logPaymentAttempt(
          senderUser.id,
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

      const todayPaymentLogs = await getAllData("PaymentLog", {
        userId: senderUser.id,
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
          lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
        },
      });

      //? Çünkü max günlük işlem sayısında başarısız işlemleri de saymalıyız
      // Check daily payment limit
      if (todayPaymentLogs.length >= senderUser.dailyPaymentLimit) {
        await logPaymentAttempt(
          senderUser.id,
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

      //? SHOULD I ADD CONDITION FOR EXCEEDED MONEY?
      // Check maximum allowed payment amount
      if (amount < requiredAmount) {
        await logPaymentAttempt(
          senderUser.id,
          amount,
          transactionId,
          "FAILURE",
          `The transaction amount is less than the required (${requiredAmount} TL).`
        );
        return res.status(403).json({
          status: "error",
          message: `The transaction amount is less than the required (${requiredAmount} TL).`,
        });
      }

      // Find the relevant wallet
      const [senderUserWallet, receiverUserWallet] = await Promise.all([
        getUniqueData("Wallet", { userId: senderUserId }),
        getUniqueData("Wallet", { userId: receiverUserId }),
      ]);

      if (!senderUserWallet || !receiverUserWallet) {
        const missingUserId = !senderUserWallet
          ? senderUser.id
          : receiverUser.id;
        const missingUserMessage = !senderUserWallet
          ? "senderUserWallet not found"
          : "receiverUserWallet not found";
        await logPaymentAttempt(
          missingUserId,
          amount,
          transactionId,
          "FAILURE",
          missingUserMessage
        );

        return res.status(404).json({
          status: "error",
          message: missingUserMessage,
        });
      }

      // Perform the transaction atomically to avoid partial updates
      const result = await prisma.$transaction(async () => {
        // Record the transaction
        const newTransaction = await createNewData("Transaction", {
          id: transactionId,
          userId: receiverUserId,
          walletId: receiverUserWallet.id,
          type: "transfer",
          amount,
          status: "PENDING",
          description: description || "Transfer transaction",
        });

        // Update the wallets balance safely
        const [updatedSenderWallet, updatedReceiverWallet] = await Promise.all([
          updateDataByAny(
            "Wallet",
            { id: senderUserWallet.id },
            { balance: { decrement: amount } }
          ),
          updateDataByAny(
            "Wallet",
            { id: receiverUserWallet.id },
            { balance: { increment: amount } }
          ),
        ]);

        // If everything is alright, make a log of the payment
        await logPaymentAttempt(
          receiverUser.id,
          amount,
          newTransaction.id,
          "SUCCESS",
          `Money transfer to ${receiverUser.fullname} succeeded`
        );

        return { newTransaction, updatedSenderWallet, updatedReceiverWallet };
      });

      return res.status(200).json({
        status: "success",
        message: "API request succeeded",
        data: result,
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
