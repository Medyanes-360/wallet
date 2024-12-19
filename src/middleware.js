import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default async function middleware(req) {
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const currentPath = req.nextUrl.pathname;
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  if (currentPath !== "/api/log" && currentPath !== "/wallet") {
    const body = await readRequestBody(req);

    await logToApi(await logRequest(req, body));
  }

  if (!session) {
    return NextResponse.rewrite(`${baseUrl}/auth/signin`);
  }

  if (session.role === "USER" && currentPath.startsWith("/admin")) {
    return NextResponse.rewrite(`${baseUrl}/`);
  }

  return NextResponse.next();
}

async function logRequest(req, body) {
  const log = {
    method: req.method,
    url: req.url,
    ip: getClientIp(req),
    timestamp: new Date().toISOString(),
    sessionStatus: req.headers.cookie?.includes("__session")
      ? "Active session"
      : "No session",
    headers: {
      "user-agent": req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      "x-forwarded-for": req.headers.get("x-forwarded-for"),
    },
    body, // Body'yi log içine ekle
    anomalies: [],
  };

  // Anomaly detection
  if (!log.sessionStatus.includes("Active"))
    log.anomalies.push("Missing session");
  if (!["GET", "POST", "PUT", "DELETE"].includes(req.method))
    log.anomalies.push(`Unsupported method: ${req.method}`);

  return log;
}

function getClientIp(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip;
  return ip;
}

async function logToApi(logData) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    });
  } catch (error) {
    console.error("Loglama API'sine istek gönderilemedi:", error);
  }
}

async function readRequestBody(req) {
  const body = req.body; // Body stream
  if (!body) return null;

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let done = false;

  while (!done) {
    const { value, done: readDone } = await reader.read();
    done = readDone;
    if (value) result += decoder.decode(value);
  }

  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
}

export const config = {
  matcher: ["/api/payment", "/api/withdraw", "/api/transfer", "/wallet"],
};