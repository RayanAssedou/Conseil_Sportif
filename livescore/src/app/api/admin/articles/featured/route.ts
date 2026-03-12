import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { article_id } = await req.json();

  await supabase.from("articles").update({ is_featured: false }).eq("is_featured", true);

  if (article_id) {
    const { error } = await supabase
      .from("articles")
      .update({ is_featured: true, updated_at: new Date().toISOString() })
      .eq("id", article_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
