import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchFromAPI } from "@/lib/api";

/** Search teams via API-Football, then return upcoming fixtures for top matches (admin only). */
export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ response: [], message: "Enter at least 2 characters" });
  }

  try {
    const teamsData = (await fetchFromAPI("teams", { search: q })) as {
      response?: Array<{ team?: { id: number } } | { id?: number }>;
    };
    const raw = teamsData.response ?? [];
    const teamIds = new Set<number>();
    for (const item of raw.slice(0, 8)) {
      const id =
        "team" in item && item.team?.id != null
          ? item.team.id
          : "id" in item && item.id != null
            ? item.id
            : null;
      if (id != null) teamIds.add(id);
    }

    const seenFixtureIds = new Set<number>();
    const merged: unknown[] = [];

    for (const teamId of teamIds) {
      const fixData = (await fetchFromAPI("fixtures", {
        team: String(teamId),
        next: "10",
      })) as { response?: unknown[] };
      const arr = fixData.response ?? [];
      for (const f of arr) {
        const row = f as { fixture?: { id?: number } };
        const fid = row.fixture?.id;
        if (fid != null && !seenFixtureIds.has(fid)) {
          seenFixtureIds.add(fid);
          merged.push(f);
        }
      }
    }

    merged.sort((a, b) => {
      const ta = new Date((a as { fixture?: { date?: string } }).fixture?.date ?? 0).getTime();
      const tb = new Date((b as { fixture?: { date?: string } }).fixture?.date ?? 0).getTime();
      return ta - tb;
    });

    return NextResponse.json({ response: merged });
  } catch (e) {
    console.error("admin matches search:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
