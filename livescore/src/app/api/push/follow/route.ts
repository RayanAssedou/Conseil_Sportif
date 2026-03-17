import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, fixtureId, type } = await request.json();

    if (!endpoint || !fixtureId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("push_follows")
      .upsert(
        {
          subscription_id: sub.id,
          fixture_id: fixtureId,
          follow_type: type,
        },
        { onConflict: "subscription_id,fixture_id" }
      );

    if (error) {
      console.error("Push follow error:", error);
      return NextResponse.json({ error: "Failed to save follow" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push follow error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint, fixtureId } = await request.json();

    if (!endpoint || !fixtureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("push_follows")
      .delete()
      .eq("subscription_id", sub.id)
      .eq("fixture_id", fixtureId);

    if (error) {
      console.error("Push unfollow error:", error);
      return NextResponse.json({ error: "Failed to remove follow" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push unfollow error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
