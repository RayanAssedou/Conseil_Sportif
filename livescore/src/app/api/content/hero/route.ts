import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hero_config")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({
        title: "Football Hub",
        subtitle: "Your one-stop destination for live scores, expert predictions, and the latest football news from around the world.",
        background_type: "color",
        background_value: "#dc2626",
        button1_text: "Live Scores",
        button1_link: "/scores",
        button1_bg_color: "#ffffff",
        button1_text_color: "#dc2626",
        button2_text: "Predictions",
        button2_link: "/pronostics",
        button2_bg_color: "rgba(255,255,255,0.15)",
        button2_text_color: "#ffffff",
        button2_border_color: "rgba(255,255,255,0.2)",
      });
    }

    return NextResponse.json(data || {
      title: "Football Hub",
      subtitle: "Your one-stop destination for live scores, expert predictions, and the latest football news from around the world.",
      background_type: "color",
      background_value: "#dc2626",
      button1_text: "Live Scores",
      button1_link: "/scores",
      button1_bg_color: "#ffffff",
      button1_text_color: "#dc2626",
      button2_text: "Predictions",
      button2_link: "/pronostics",
      button2_bg_color: "rgba(255,255,255,0.15)",
      button2_text_color: "#ffffff",
      button2_border_color: "rgba(255,255,255,0.2)",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
