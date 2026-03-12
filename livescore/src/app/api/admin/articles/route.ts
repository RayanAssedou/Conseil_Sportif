import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { data, error } = await supabase.from("articles").select("*").order("sort_order").order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const payload: Record<string, unknown> = {
    title: body.title,
    summary: body.summary,
    content: body.content,
    category: body.category || "Football",
    image_url: body.image_url,
    link: body.link,
    published_at: body.published_at || new Date().toISOString(),
    show_in_latest: body.show_in_latest !== false,
    sort_order: body.sort_order ?? 0,
    is_featured: body.is_featured || false,
  };

  const optionalCols = ["content", "is_featured"];
  let result = await supabase.from("articles").insert(payload).select().single();

  while (result.error?.code === "42703" && optionalCols.length > 0) {
    const col = optionalCols.shift()!;
    delete payload[col];
    result = await supabase.from("articles").insert(payload).select().single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.data);
}
