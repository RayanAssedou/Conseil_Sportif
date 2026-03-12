import { NextRequest, NextResponse } from "next/server";
import { fetchFixtureLineups } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await fetchFixtureLineups(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching lineups:", error);
    return NextResponse.json({ error: "Failed to fetch lineups" }, { status: 500 });
  }
}
