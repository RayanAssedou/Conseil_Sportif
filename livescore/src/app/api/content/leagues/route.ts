import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await supabase
      .from("section_settings")
      .select("title")
      .eq("section_key", "displayed_leagues")
      .maybeSingle();

    const ids: number[] = data?.title ? JSON.parse(data.title) : [];
    return NextResponse.json({ league_ids: ids });
  } catch {
    return NextResponse.json({ league_ids: [] });
  }
}
