import { NextRequest, NextResponse } from "next/server";
import { fetchFixturesLive, fetchFixturesByDate, fetchFromAPI } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const live = searchParams.get("live");
  const date = searchParams.get("date");
  const teamId = searchParams.get("teamId");
  const last = searchParams.get("last");

  try {
    let data;
    if (teamId && last) {
      data = await fetchFromAPI("fixtures", { team: teamId, last });
    } else if (live === "all") {
      data = await fetchFixturesLive();
    } else if (date) {
      data = await fetchFixturesByDate(date);
    } else {
      const today = new Date().toISOString().split("T")[0];
      data = await fetchFixturesByDate(today);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json({ error: "Failed to fetch fixtures" }, { status: 500 });
  }
}
