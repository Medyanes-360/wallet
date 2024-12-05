import { getUniqueData } from "../../../../../services/serviceOperations";

const handle = async (req, res) => {
  if (req.method === "GET") {
    try {
      // retrieve user id to get user's bankAccounts
      // const { userId, bankAccountId } = await req.body
      const { id } = await req.query;
      const data = await getUniqueData("BankAccount", { id });
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
