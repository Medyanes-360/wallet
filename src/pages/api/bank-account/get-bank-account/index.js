import { getAllData } from "../../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      // retrieve user id to get user's bankAccounts
      const { userId } = await req.body;
      const data = await getAllData("BankAccount", {
        userId,
      });
      if (!data || data.error || data === undefined) {
        throw new Error(data.error);
      }

      return res.status(200).json({ status: "success", data });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: "error", message: "Method Not Allowed" });
  }
};

export default handle;
