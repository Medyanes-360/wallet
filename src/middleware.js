import { getToken } from "next-auth/jwt";
import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(async function middleware(req) {
  // Retrieve the session token using getToken utility
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const currentPath = req.nextUrl.pathname;

  // the base url of the website
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // If no session exists, redirect the user to the login page
  if (!session) {
    return NextResponse.rewrite(`${baseUrl}/login`); // Rewrite the request to the login page
  }

  // Restrict access to "/admin" pages and API routes if the user's role is "USER"
  if (session.role === "USER" && currentPath.startsWith("/admin") || currentPath.startsWith("/api")) {
    return NextResponse.rewrite(`${baseUrl}/`); // Rewrite to the home page
  }

  // If everything is fine, proceed with the request
  return NextResponse.next();
});

// config will be deleted later to make middleware work everywhere
export const config = {
  matcher: ["/api/payment", "/api/withdraw", "/api/transfer"],
};
