import hashPaymentData from "../../../../services/hashPaymentData";
import {
  createNewData,
  getUniqueData,
} from "../../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const cardDetails = await req.body;
      const decryptedData = hashPaymentData(cardDetails, "dec");
      const { userId, cardNumber, cardName, iban, expiryDate, cvv } =
        decryptedData;

      if (!userId || !cardNumber || !cardName || !iban || !expiryDate || !cvv) {
        return res.status(400).json({
          status: "error",
          message: "Something is invalid or missing",
        });
      }

      // check the user data in db
      const user = await getUniqueData("User", { id: userId });
      if (!user) {
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
          FAILURE,
          "The action cannot be performed because of the user's role"
        );
        return res.status(403).json({
          status: "error",
          message: "The action cannot be performed because of the user's role",
        });
      }

      const bankAccount = await getUniqueData("BankAccount", {
        cardNumber,
      });

      if (bankAccount) {
        return res.status(400).json({
          status: "error",
          message: "The bank card has already been added",
        });
      }

      const newBankAccount = await createNewData("BankAccount", {
        userId,
        cardName,
        cardNumber,
        iban,
        expiryDate,
        cvv,
      });

      if (!newBankAccount) {
        return res.status(400).json({
          status: "error",
          message: "Something went wrong",
        });
      }

      return res.status(200).json({ status: "success", data: newBankAccount });
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
