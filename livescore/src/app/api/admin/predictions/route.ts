import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const fixtureIds = searchParams.get("fixtureIds");

  let query = supabase.from("predictions").select("*").order("match_date", { ascending: true });

  if (fixtureIds) {
    const ids = fixtureIds.split(",").map((id) => parseInt(id, 10)).filter(Boolean);
    query = query.in("fixture_id", ids);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();

  const payload = {
    fixture_id: body.fixture_id,
    home_team: body.home_team,
    away_team: body.away_team,
    home_logo: body.home_logo || null,
    away_logo: body.away_logo || null,
    league_name: body.league_name || null,
    match_date: body.match_date || null,
    predicted_home: body.predicted_home || "0",
    predicted_away: body.predicted_away || "0",
    advice: body.advice || null,
    prob_home: body.prob_home || null,
    prob_draw: body.prob_draw || null,
    prob_away: body.prob_away || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("predictions")
    .upsert(payload, { onConflict: "fixture_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
