import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "latest_news";

  const defaults = {
    section_key: key,
    title: "Latest News",
    view_all_text: "View all",
    view_all_link: "/articles",
  };

  try {
    const { data, error } = await supabase
      .from("section_settings")
      .select("*")
      .eq("section_key", key)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ...defaults }, { status: 200 });
    }

    return NextResponse.json(data || defaults);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
