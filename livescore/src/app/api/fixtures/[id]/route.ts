import { NextRequest, NextResponse } from "next/server";
import { fetchFixtureById } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await fetchFixtureById(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching fixture:", error);
    return NextResponse.json({ error: "Failed to fetch fixture" }, { status: 500 });
  }
}
