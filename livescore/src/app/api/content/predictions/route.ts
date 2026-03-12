import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .gte("match_date", now)
    .order("match_date", { ascending: true });

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}
