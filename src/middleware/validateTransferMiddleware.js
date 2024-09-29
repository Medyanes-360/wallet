import { NextResponse } from "next/server";
import prisma from "../../prisma";
import logPaymentAttempt from "../services/logPaymentAttempt";

export const config = {
  matcher: ["/api/transfer"],
};

// Transaction limits
const DAILY_WITHDRAW_LIMIT = 5;

export const validateTransferMiddleware = async (request) => {
  const { senderId, receiverId, amount, transactionId, isPaymentVerified } =
    await request.json();

  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.user.findUnique({ where: { id: receiverId } }),
  ]);

  if (!sender || !receiver) {
    const missingUserId = !sender ? senderId : receiverId;
    await logPaymentAttempt(
      missingUserId,
      amount,
      transactionId,
      "User not found"
    );
    return NextResponse.json({ status: 404, message: "User not found" });
  }

  // Fetch payment attempts made by the user today
  const todayWithdraw = await prisma.transaction.findMany({
    where: {
      walletId: sender.walletId,
      type: "transfer",
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
        lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
      },
    },
  });

  // Check daily payment limit
  if (todayWithdraw.length >= DAILY_WITHDRAW_LIMIT) {
    await logPaymentAttempt(
      senderId,
      amount,
      transactionId,
      "Daily payment limit exceeded"
    );
    return NextResponse.json({
      status: 403,
      message: "Daily payment limit exceeded",
    });
  }

  // Fetch user's wallet
  const wallet = await prisma.wallet.findUnique({
    where: {
      id: sender.walletId,
    },
  });

  // Check if wallet exists
  if (!wallet) {
    //? DO WE NEED TO LOG THIS STATEMENT AS WELL?
    await logPaymentAttempt(
      senderId,
      amount,
      transactionId,
      "Wallet not found"
    );
    return NextResponse.json({
      status: 404,
      message: "Wallet not found",
    });
  }

  // Check if the withdrawal amount exceeds the available balance
  if (amount > wallet.balance) {
    await logPaymentAttempt(
      senderId,
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
      senderId,
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
