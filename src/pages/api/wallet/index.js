import { getAllData, getUniqueData } from "../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { userId } = await req.body;

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User id is missing",
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
        return res.status(403).json({
          status: "error",
          message: "The action cannot be performed because of the user's role",
        });
      }

      const wallet = await getUniqueData("Wallet", { userId });
      if (!wallet) {
        return res.status(404).json({
          status: "error",
          message: "Wallet not found for the user",
        });
      }

      // Fetch transactions associated with the wallet
      const transactions = await getAllData("Transaction", {
        walletId: wallet.id,
      });
      if (transactions.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No Transaction has been made yet",
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          wallet,
          transactions,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: "error", message: "Method Not Allowed" });
  }
};

export default handle;
