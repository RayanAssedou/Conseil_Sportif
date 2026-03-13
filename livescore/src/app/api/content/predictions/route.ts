import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .gte("match_date", todayStart)
    .order("match_date", { ascending: true });

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}
