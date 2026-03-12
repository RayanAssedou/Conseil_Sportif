import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { id } = await params;
  const body = await req.json();

  const payload: Record<string, unknown> = {
    title: body.title,
    summary: body.summary,
    content: body.content,
    category: body.category,
    image_url: body.image_url,
    link: body.link,
    published_at: body.published_at,
    show_in_latest: body.show_in_latest,
    sort_order: body.sort_order,
    is_featured: body.is_featured ?? false,
    updated_at: new Date().toISOString(),
  };

  const optionalCols = ["content", "is_featured"];
  let result = await supabase.from("articles").update(payload).eq("id", id).select().single();

  while (result.error?.code === "42703" && optionalCols.length > 0) {
    const col = optionalCols.shift()!;
    delete payload[col];
    result = await supabase.from("articles").update(payload).eq("id", id).select().single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { id } = await params;
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
