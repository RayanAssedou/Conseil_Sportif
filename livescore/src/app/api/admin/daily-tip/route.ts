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
  const fixtureId = row?.featured_fixture_id ?? null;

  let prediction = null;
  if (fixtureId) {
    const { data } = await supabase.from("predictions").select("*").eq("fixture_id", fixtureId).single();
    prediction = data || null;
  }

  return NextResponse.json({ featured_fixture_id: fixtureId, prediction });
}

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const featured_fixture_id =
    body.featured_fixture_id === null || body.featured_fixture_id === undefined || body.featured_fixture_id === ""
      ? null
      : Number(body.featured_fixture_id);

  const payload = { featured_fixture_id, updated_at: new Date().toISOString() };

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
