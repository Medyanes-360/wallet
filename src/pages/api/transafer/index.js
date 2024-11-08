import logPaymentAttempt from "../../../services/logPaymentAttempt";
import {
  createNewData,
  getAllData,
  getUniqueData,
  updateDataByAny,
} from "../../../services/serviceOperations";

const SUCCESS = "SUCCESS";
const PENDING = "PENDING";
const FAILURE = "FAILURE";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const {
        senderUserId,  // userEmail: to check whether the user exists or not
        receiverUserEmail, // receiverUserEmail: to check whether the user exists or not
        amount,  // amount: to log the amount of money and make the process
        requiredAmount,  // this is a required amount that the receiverUser set
        transactionId,  // transactionId: to idenify the payment process
        description,  // description: is not necessary, but if a user desires, they can leave a description for the paypment
      } = await req.body;

      // check the received data
      if (!senderUserId || !receiverUserEmail || !amount || amount <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Something went wrong",
        });
      }

      // check the users data in db
      const [senderUser, receiverUser] = await Promise.all([
        getUniqueData("User", { id: senderUserId }),
        getUniqueData("User", { email: receiverUserEmail }),
      ]);
      if (!senderUser || !receiverUser) {
        const missingUser = !senderUser ? senderUserId : receiverUserEmail;
        const missingUserMessage = !senderUser
          ? "senderUser not found"
          : "receiverUser not found";
        await logPaymentAttempt(
          missingUser,
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

      // check the users role
      if (senderUser.role && senderUser.role === "ADMIN") {
        await logPaymentAttempt(
          senderUser.id,
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
          FAILURE,
          "Daily payment limit exceeded"
        );
        return res.status(403).json({
          status: "error",
          message: "Daily payment limit exceeded.",
        });
      }

      //? SHOULD I ADD CONDITION FOR EXCEEDED MONEY?
      // Check maximum allowed payment amount
      // Do we need required or not
      if (amount < requiredAmount) {
        await logPaymentAttempt(
          senderUser.id,
          amount,
          transactionId,
          FAILURE,
          `The transaction amount is less than the required (${requiredAmount} TL).`
        );
        return res.status(403).json({
          status: "error",
          message: `The transaction amount is less than the required (${requiredAmount} TL).`,
        });
      }

      // Find the relevant wallet
      const [senderUserWallet, receiverUserWallet] = await Promise.all([
        getUniqueData("Wallet", { userId: senderUser.id }),
        getUniqueData("Wallet", { userId: receiverUser.id }),
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
          FAILURE,
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
          userId: senderUser.id,
          walletId: senderUserWallet.id,
          type: "transfer",
          amount,
          status: PENDING,
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
          senderUser.id,
          amount,
          newTransaction.id,
          SUCCESS,
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
