import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";

export async function POST(request: NextRequest) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json(
      { error: "VAPID keys not configured", public: !!VAPID_PUBLIC, private: !!VAPID_PRIVATE },
      { status: 500 }
    );
  }

  try {
    webpush.setVapidDetails("mailto:push@sporthamal.com", VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid VAPID keys", details: String(err) },
      { status: 500 }
    );
  }

  try {
    const { endpoint } = await request.json();

    const query = endpoint
      ? supabase.from("push_subscriptions").select("*").eq("endpoint", endpoint).limit(1)
      : supabase.from("push_subscriptions").select("*").limit(1);

    const { data: subs, error: dbErr } = await query;

    if (dbErr) {
      return NextResponse.json(
        { error: "Database error", details: dbErr.message, hint: dbErr.hint },
        { status: 500 }
      );
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found in database. Visit the site and click a reminder/alert button first." },
        { status: 404 }
      );
    }

    const sub = subs[0];
    const results = [];

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: "Test Push — Hamal Sport",
          body: "Les notifications push fonctionnent correctement !",
          url: "/",
          tag: "test-push",
        })
      );
      results.push({ endpoint: sub.endpoint.slice(0, 60) + "...", status: "sent" });
    } catch (err: unknown) {
      const pushErr = err as { statusCode?: number; body?: string; message?: string };
      results.push({
        endpoint: sub.endpoint.slice(0, 60) + "...",
        status: "failed",
        statusCode: pushErr.statusCode,
        error: pushErr.body || pushErr.message,
      });
    }

    return NextResponse.json({
      ok: true,
      totalSubscriptions: subs.length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error", details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const diagnostics = {
    vapidPublicKey: VAPID_PUBLIC ? `${VAPID_PUBLIC.slice(0, 20)}...` : "NOT SET",
    vapidPrivateKey: VAPID_PRIVATE ? "SET (hidden)" : "NOT SET",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
    serviceKey: process.env.SUPABASE_SERVICE_KEY ? "SET" : "NOT SET",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
  };

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, locale, created_at")
    .limit(10);

  const { data: follows, error: followsErr } = await supabase
    .from("push_follows")
    .select("id, subscription_id, fixture_id, follow_type, created_at")
    .limit(20);

  const { data: states, error: statesErr } = await supabase
    .from("match_push_states")
    .select("*")
    .limit(10);

  return NextResponse.json({
    diagnostics,
    subscriptions: error
      ? { error: error.message, hint: error.hint, code: error.code }
      : { count: subs?.length ?? 0, items: subs?.map((s) => ({ id: s.id, endpoint: s.endpoint?.slice(0, 60) + "...", locale: s.locale, created_at: s.created_at })) },
    follows: followsErr
      ? { error: followsErr.message }
      : { count: follows?.length ?? 0, items: follows },
    matchStates: statesErr
      ? { error: statesErr.message }
      : { count: states?.length ?? 0, items: states },
  });
}
