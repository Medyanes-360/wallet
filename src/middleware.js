import { paymentMiddleware } from "./middleware/paymentMiddleware";
import { withdrawMiddleware } from "./middleware/withdrawMiddleware";
import { transferMiddleware } from "./middleware/transferMiddleware";

import { NextResponse } from "next/server";

export async function middleware(req) {
  // const { pathname } = req.nextUrl;
  

  // if (pathname.startsWith("/api/payment")) {
  //   const paymentResponse = await paymentMiddleware(request);
  //   if (paymentResponse) return paymentResponse;
  // }

  // if (pathname.startsWith("/api/withdraw")) {
  //   const withdrawResponse = await withdrawMiddleware(request);
  //   if (withdrawResponse) return withdrawResponse;
  // }

  // if (pathname.startsWith("/api/transfer")) {
  //   const transferResponse = await transferMiddleware(request);
  //   if (transferResponse) return transferResponse;
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/payment", "/api/withdraw", "/api/transfer"],
};
