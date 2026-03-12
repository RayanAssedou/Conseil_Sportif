import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { data, error } = await supabase.from("hero_config").select("*").limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] || {});
}

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const { data: rows } = await supabase.from("hero_config").select("id").limit(1);
  const existing = rows?.[0];

  const payload = {
    title: body.title,
    subtitle: body.subtitle,
    background_type: body.background_type || "color",
    background_value: body.background_value || "#dc2626",
    button1_text: body.button1_text,
    button1_link: body.button1_link,
    button1_bg_color: body.button1_bg_color,
    button1_text_color: body.button1_text_color,
    button2_text: body.button2_text,
    button2_link: body.button2_link,
    button2_bg_color: body.button2_bg_color,
    button2_text_color: body.button2_text_color,
    button2_border_color: body.button2_border_color,
    title_he: body.title_he || "",
    subtitle_he: body.subtitle_he || "",
    button1_text_he: body.button1_text_he || "",
    button2_text_he: body.button2_text_he || "",
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase.from("hero_config").update(payload).eq("id", existing.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase.from("hero_config").insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
