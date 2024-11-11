import prisma from "../../../../prisma";

const handle = async (req, res) => {
  if (req.method === "GET") {
    try {
      // Use Prisma's aggregate to get a total balance across all wallets.
      // _sum calculates the sum for a specified field, in this case, the `balance` field in the wallet model.
      const result = await prisma.wallet.aggregate({
        _sum: { balance: true }, // Tells Prisma to sum up all `balance` values across wallet records.
      });
      // Extract the total summed balance from the result of the aggregation query.
      // `result._sum.balance` contains the total balance sum across all wallets.
      const totalBalance = result._sum.balance || 0;

      return res.status(200).json({ totalBalance });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Erorr fetching total system balance" || error,
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
