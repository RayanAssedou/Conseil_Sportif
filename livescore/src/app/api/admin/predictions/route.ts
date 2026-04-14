import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails("mailto:push@sporthamal.com", VAPID_PUBLIC, VAPID_PRIVATE);
}

const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000;
const STATE_KEY = "_prediction_push_state";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const fixtureIds = searchParams.get("fixtureIds");

  let query = supabase.from("predictions").select("*").order("match_date", { ascending: true });

  if (fixtureIds) {
    const ids = fixtureIds.split(",").map((id) => parseInt(id, 10)).filter(Boolean);
    query = query.in("fixture_id", ids);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();

  const payload = {
    fixture_id: body.fixture_id,
    home_team: body.home_team,
    away_team: body.away_team,
    home_logo: body.home_logo || null,
    away_logo: body.away_logo || null,
    league_name: body.league_name || null,
    match_date: body.match_date || null,
    predicted_home: body.predicted_home || "0",
    predicted_away: body.predicted_away || "0",
    advice: body.advice || null,
    prob_home: body.prob_home || null,
    prob_draw: body.prob_draw || null,
    prob_away: body.prob_away || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("predictions")
    .upsert(payload, { onConflict: "fixture_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await sendPredictionNotifications();
  } catch (e) {
    console.error("Prediction notification error:", e);
  }

  return NextResponse.json(data);
}

async function sendPredictionNotifications() {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const { data: stateRow } = await supabase
    .from("section_settings")
    .select("view_all_link")
    .eq("section_key", STATE_KEY)
    .maybeSingle();

  const lastNotifyTime = stateRow?.view_all_link ? parseInt(stateRow.view_all_link, 10) : 0;
  if (Date.now() - lastNotifyTime < NOTIFY_COOLDOWN_MS) return;

  await supabase
    .from("section_settings")
    .upsert(
      { section_key: STATE_KEY, title: "", view_all_text: "", view_all_link: String(Date.now()) },
      { onConflict: "section_key" }
    );

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (!subscriptions || subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: "New Predictions Available",
    body: "Fresh match predictions are ready — check them out!",
    url: "/pronostics",
    tag: `predictions-new-${Date.now()}`,
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
    } catch (err: unknown) {
      if (err && typeof err === "object" && "statusCode" in err) {
        const pushErr = err as { statusCode: number };
        if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }
  }
}
