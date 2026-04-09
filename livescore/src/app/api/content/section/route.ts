import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SOCIAL_DEFAULTS: Record<string, string> = {
  telegram: "https://t.me/Niv_grafica",
  whatsapp: "https://wa.me/972504593270",
  instagram: "https://www.instagram.com/nivphotografi?igsh=MTVuMG90bG1kZGkzcw==",
  facebook: "https://www.facebook.com/share/g/1FjxBVg48G/",
  tiktok: "https://www.tiktok.com/@niv_winner_tips?_r=1&_t=ZS-958O1XrBfQC",
  twitter: "https://x.com/nivphotograf",
  youtube: "https://youtube.com/channel/UCSiVU6MH4GCS9-68ClAsyEQ?si=e7blRdgdbT1CT8mD",
  whatsapp_vip: "https://wa.me/972504593270",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "latest_news";

  const defaults = {
    section_key: key,
    title: "",
    view_all_text: "",
    view_all_link: SOCIAL_DEFAULTS[key] || "/articles",
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
