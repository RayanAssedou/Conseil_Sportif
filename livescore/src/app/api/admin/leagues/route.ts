import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { data } = await supabase
    .from("section_settings")
    .select("*")
    .eq("section_key", "displayed_leagues")
    .maybeSingle();

  const ids: number[] = data?.title ? JSON.parse(data.title) : [];
  return NextResponse.json({ league_ids: ids });
}

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const ids: number[] = Array.isArray(body.league_ids) ? body.league_ids : [];

  const { error } = await supabase
    .from("section_settings")
    .upsert(
      {
        section_key: "displayed_leagues",
        title: JSON.stringify(ids),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "section_key" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: ids.length });
}
