const logPaymentAttempt = async (
  userId,
  amount,
  transactionId,
  status,
  statusDescription
) => {
  try {
    await prisma.paymentLog.create({
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
