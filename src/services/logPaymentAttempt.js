import { createNewData } from "./serviceOperations";

const logPaymentAttempt = async (
  userId,
  amount,
  transactionId,
  status,
  statusDescription
) => {
  try {
    await createNewData("PaymentLog", {
      data: {
        userId,
        amount,
        transactionId,
        status,
        statusDescription,
      },
    });
  } catch (error) {
    console.error("Error logging payment attmept", error);
  }
};

export default logPaymentAttempt;
