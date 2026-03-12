import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";
const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET || "fallback-secret-change-me");

export async function createAdminSession(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyAdminSession(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.username ? { username: String(payload.username) } : null;
  } catch {
    return null;
  }
}

export function getAdminToken(req: NextRequest): string | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  return cookie?.value ?? null;
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = getAdminToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await verifyAdminSession(token);
  if (!session) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  return null;
}

export function setAdminCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}
