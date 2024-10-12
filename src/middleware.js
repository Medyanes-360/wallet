import { getToken } from "next-auth/jwt";
import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(async function middleware(req) {
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const currentPath = req.nextUrl.pathname

  const baseUrl = process.env.NEXT_PUBLIC_URL 

  if (!session) {
    return NextResponse.rewrite(`${baseUrl}/login`);
  }

  if(session.role === "USER" && currentPath.startsWith("/admin")) {
    return NextResponse.rewrite(`${baseUrl}/`)
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/payment", "/api/withdraw", "/api/transfer"],
};
