import { NextResponse } from "next/server";
import prisma from "../../prisma";
import logPaymentAttempt from "../services/logPaymentAttempt";

const DAILY_WITHDRAW_LIMIT = 5;

export const withdrawMiddleware = async (request) => {
  const { userId, amount, transactionId, isPaymentVerified } =
    await request.body;

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
  const todayWithdraw = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "withdraw",
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
        lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
      },
    },
  });

  //? WHERE SHOULD WE SAVE WITHDRAW LIMIT? SHOULD IT BE CONSTANT OR A FIELD IN USER MODEL IN PRISMA SCHEMA
  // Check daily payment limit
  if (todayWithdraw.length >= DAILY_WITHDRAW_LIMIT) {
    await logPaymentAttempt(
      userId,
      amount,
      transactionId,
      "Daily withdraw limit exceeded"
    );
    return NextResponse.json({
      status: 403,
      message: "Daily withdraw limit exceeded",
    });
  }

  // Fetch user's wallet
  const wallet = await prisma.wallet.findUnique({
    where: {
      id: user.walletId,
    },
  });

  // Check if wallet exists
  if (!wallet) {
    //? DO WE NEED TO LOG THIS STATEMENT AS WELL?
    await logPaymentAttempt(userId, amount, transactionId, "Wallet not found");
    return NextResponse.json({
      status: 404,
      message: "Wallet not found",
    });
  }

  // Check if the withdrawal amount exceeds the available balance
  if (amount > wallet.balance) {
    await logPaymentAttempt(
      userId,
      amount,
      transactionId,
      "Insufficient funds"
    );
    return NextResponse.json({
      status: 403,
      message: "Insufficient funds",
    });
  }

  // Check if the payment has been verified through email or SMS.
  if (!isPaymentVerified) {
    await logPaymentAttempt(
      userId,
      amount,
      transactionId,
      "Payment not verified. Please verify the payment before sending request"
    );
    return NextResponse.json({
      status: 403,
      message:
        "Payment not verified. Please verify the payment before sending request",
    });
  }

  return NextResponse.next();
};
