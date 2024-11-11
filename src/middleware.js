import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default async function middleware(req) {
  // Retrieve the session token using getToken utility
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const currentPath = req.nextUrl.pathname;
  // the base url of the website
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // If no session exists, rewrite the request to the signin page
  //? redirect to the main page
  if (!session) {
    return NextResponse.rewrite(`${baseUrl}/auth/signin`);
  }

  // Restrict access to "/admin" pages if the user's role is "USER"
  if (session.role === "USER" && currentPath.startsWith("/admin")) {
    return NextResponse.rewrite(`${baseUrl}/`); // Rewrite to the home page
  }

  // If everything is fine, proceed with the request
  return NextResponse.next();
};

// config will be deleted later to make middleware work everywhere
export const config = {
  matcher: ["/api/payment", "/api/withdraw", "/api/transfer", "/wallet"],
};
