import { NextRequest, NextResponse } from "next/server";
import { fetchFromAPI } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const h2h = searchParams.get("h2h");
  const last = searchParams.get("last") || "5";

  if (!h2h) {
    return NextResponse.json({ error: "h2h parameter required" }, { status: 400 });
  }

  try {
    const data = await fetchFromAPI("fixtures/headtohead", { h2h, last });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching h2h:", error);
    return NextResponse.json({ error: "Failed to fetch head to head" }, { status: 500 });
  }
}
