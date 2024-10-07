import { NextResponse } from "next/server";
import prisma from "../../prisma";
import logPaymentAttempt from "../services/logPaymentAttempt";

const MAX_AMOUNT = 10000;

export const paymentMiddleware = async (req) => {
  const { userId, amount, transactionId, isPaymentVerified } =
    await req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    await logPaymentAttempt(userId, amount, transactionId, "User not found");
    return NextResponse.json(
      { status: "error", message: "User not found" },
      { status: 404 }
    );
  }

  // Fetch payment attempts made by the user today
  const todayPayments = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "payment",
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
        lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
      },
    },
  });

  // Check daily payment limit
  if (todayPayments.length > user.dailyPaymentLimit) {
    await logPaymentAttempt(
      userId,
      amount,
      transactionId,
      "Daily payment limit exceeded"
    );
    return NextResponse.json(
      { status: "error", message: "Daily payment limit exceeded" },
      { status: 403 }
    );
  }

  // Check maximum allowed payment amount
  if (amount > MAX_AMOUNT) {
    await logPaymentAttempt(
      userId,
      amount,
      transactionId,
      `Maximum transaction amount exceeded (Limit: ${MAX_AMOUNT} TL)`
    );
    return NextResponse.json(
      {
        status: "error",
        message: `Maximum transaction amount exceeded (Limit: ${MAX_AMOUNT} TL)`,
      },
      { status: 403 }
    );
  }

  // Check if the payment has been verified through email or SMS.
  if (!isPaymentVerified) {
    await logPaymentAttempt(
      userId,
      amount,
      transactionId,
      "Payment not verified. Please verify the payment before sending request"
    );
    return NextResponse.json(
      {
        status: "error",
        message:
          "Payment not verified. Please verify the payment before sending request",
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
};
