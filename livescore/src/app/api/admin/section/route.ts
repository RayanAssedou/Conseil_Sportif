import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const sectionKey = body.section_key || "latest_news";

  const { error } = await supabase
    .from("section_settings")
    .upsert({ section_key: sectionKey, title: body.title, view_all_text: body.view_all_text, view_all_link: body.view_all_link, updated_at: new Date().toISOString() }, { onConflict: "section_key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
