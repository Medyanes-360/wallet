const logPaymentAttempt = async (userId, amount, status, transactionId) => {
  try {
    await prisma.paymentLog.create({
      data: {
        userId,
        amount,
        status,
        transactionId,
      },
    });
  } catch (error) {
    console.error("Error logging payment attmept", error);
  }
};

export default logPaymentAttempt;
