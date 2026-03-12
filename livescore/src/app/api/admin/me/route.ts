import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req);
  if (!token) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  const session = await verifyAdminSession(token);
  if (!session) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  return NextResponse.json({ authed: true, username: session.username });
}
