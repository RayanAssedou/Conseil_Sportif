import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latestOnly = searchParams.get("latest") === "true";
  const limit = searchParams.get("limit");

  try {
    let query = supabase
      .from("articles")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (latestOnly) {
      query = query.eq("show_in_latest", true);
    }
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
