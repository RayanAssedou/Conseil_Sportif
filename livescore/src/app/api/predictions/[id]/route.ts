import { NextRequest, NextResponse } from "next/server";
import { fetchFromAPI } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await fetchFromAPI("predictions", { fixture: id });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}
