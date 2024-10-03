import { validatePaymentMiddleware } from "../../../middleware/validatePaymentMiddleware";

const handle = async (req, res) => {
  if (req.method === "POST") {
    try {
      const middlewareResponse = await validatePaymentMiddleware(req);

      if (!middlewareResponse.ok) {
        const middlewareResponseBody = await middlewareResponse.json();
        return res.status(middlewareResponse.status).json({
          status: "error",
          message: middlewareResponseBody.message,
        });
      }

      // If the middleware passes, proceed with payment logic
      const { userId } = await req.body;
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: "payment",
        },
      });

      return res
        .status(200)
        .json({
          status: "success",
          message: `API request succeeded`,
          transactions
        });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", error: `API CATCH ERROR: ${error.message}` });
    }
  }
};

export default handle;
