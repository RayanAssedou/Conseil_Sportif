import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;

  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("fixture_id", parseInt(fixtureId, 10))
      .maybeSingle();

    if (error) {
      return NextResponse.json(null);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}
