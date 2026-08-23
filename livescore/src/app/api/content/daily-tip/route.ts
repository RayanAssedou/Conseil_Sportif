import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Returns the featured prediction (the "Tip of the Day") ONLY to authenticated
// users whose profile is active (i.e. users the admin has marked as paid).
// Non-active users never receive the prediction, even by calling this route.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_active")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.is_active) {
    return NextResponse.json({ active: false });
  }

  const { data: tip } = await supabase.from("daily_tip").select("featured_fixture_id").limit(1).single();
  const fixtureId = tip?.featured_fixture_id ?? null;

  if (!fixtureId) {
    return NextResponse.json({ active: true, prediction: null });
  }

  const { data: prediction } = await supabase
    .from("predictions")
    .select("*")
    .eq("fixture_id", fixtureId)
    .single();

  return NextResponse.json({ active: true, prediction: prediction || null });
}
