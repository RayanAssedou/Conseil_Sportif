import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ fixtureId: string }> }) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { fixtureId } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from("predictions")
    .update({
      predicted_home: body.predicted_home || "0",
      predicted_away: body.predicted_away || "0",
      advice: body.advice || null,
      prob_home: body.prob_home || null,
      prob_draw: body.prob_draw || null,
      prob_away: body.prob_away || null,
      updated_at: new Date().toISOString(),
    })
    .eq("fixture_id", parseInt(fixtureId, 10))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ fixtureId: string }> }) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { fixtureId } = await params;
  const { error } = await supabase
    .from("predictions")
    .delete()
    .eq("fixture_id", parseInt(fixtureId, 10));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
