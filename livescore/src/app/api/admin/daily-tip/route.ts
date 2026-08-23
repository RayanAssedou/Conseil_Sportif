import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

async function getTipRow() {
  const { data } = await supabase.from("daily_tip").select("*").limit(1);
  return data?.[0] || null;
}

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const row = await getTipRow();
  return NextResponse.json(row || {});
}

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();

  // Clearing the tip: wipe all fields.
  const clear = body.clear === true;

  const payload = clear
    ? {
        featured_fixture_id: null,
        home_team: null, away_team: null, home_logo: null, away_logo: null,
        league_name: null, match_date: null,
        predicted_home: null, predicted_away: null, advice: null,
        prob_home: null, prob_draw: null, prob_away: null,
        updated_at: new Date().toISOString(),
      }
    : {
        featured_fixture_id: body.fixture_id ? Number(body.fixture_id) : null,
        home_team: body.home_team || null,
        away_team: body.away_team || null,
        home_logo: body.home_logo || null,
        away_logo: body.away_logo || null,
        league_name: body.league_name || null,
        match_date: body.match_date || null,
        predicted_home: body.predicted_home ?? "0",
        predicted_away: body.predicted_away ?? "0",
        advice: body.advice || null,
        prob_home: body.prob_home || null,
        prob_draw: body.prob_draw || null,
        prob_away: body.prob_away || null,
        updated_at: new Date().toISOString(),
      };

  const existing = await getTipRow();
  if (existing?.id) {
    const { data, error } = await supabase.from("daily_tip").update(payload).eq("id", existing.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase.from("daily_tip").insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
