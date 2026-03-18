import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";
import { fetchFixtureById } from "@/lib/api";
import { isLive, isFinished } from "@/lib/utils";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const CRON_SECRET = process.env.CRON_SECRET || "";

webpush.setVapidDetails("mailto:push@sporthamal.com", VAPID_PUBLIC, VAPID_PRIVATE);

interface FollowRow {
  fixture_id: number;
  follow_type: string;
  push_subscriptions: {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    locale: string;
  };
}

interface MatchState {
  fixture_id: number;
  home_goals: number;
  away_goals: number;
  status: string;
}

const PUSH_TEXTS: Record<string, Record<string, string>> = {
  goalScored: {
    en: "GOAL",
    he: "גול",
    ar: "هدف",
    ru: "ГОЛ",
  },
  matchStarting: {
    en: "Match Started!",
    he: "!המשחק התחיל",
    ar: "!بدأت المباراة",
    ru: "Матч начался!",
  },
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { data: follows, error: followsErr } = await supabase
      .from("push_follows")
      .select("fixture_id, follow_type, push_subscriptions(id, endpoint, p256dh, auth, locale)");

    if (followsErr || !follows || follows.length === 0) {
      return NextResponse.json({ message: "No active follows", checked: 0 });
    }

    const uniqueFixtureIds = [...new Set((follows as unknown as FollowRow[]).map((f) => f.fixture_id))];

    const { data: existingStates } = await supabase
      .from("match_push_states")
      .select("*")
      .in("fixture_id", uniqueFixtureIds);

    const stateMap = new Map<number, MatchState>();
    if (existingStates) {
      for (const s of existingStates) {
        stateMap.set(s.fixture_id, s);
      }
    }

    let pushesSent = 0;
    const finishedFixtures: number[] = [];
    const stateUpdates: MatchState[] = [];

    for (const fixtureId of uniqueFixtureIds) {
      try {
        const data = await fetchFixtureById(String(fixtureId));
        const fixture = data?.response?.[0];
        if (!fixture) continue;

        const currentStatus = fixture.fixture.status.short;
        const homeGoals = fixture.goals.home ?? 0;
        const awayGoals = fixture.goals.away ?? 0;
        const homeTeam = fixture.teams.home.name;
        const awayTeam = fixture.teams.away.name;

        const prev = stateMap.get(fixtureId);

        const subscribers = (follows as unknown as FollowRow[]).filter(
          (f) => f.fixture_id === fixtureId
        );

        if (!prev && isLive(currentStatus)) {
          for (const sub of subscribers) {
            if (sub.follow_type === "reminder") {
              const loc = sub.push_subscriptions.locale || "en";
              await sendPush(sub.push_subscriptions, {
                title: PUSH_TEXTS.matchStarting[loc] || PUSH_TEXTS.matchStarting.en,
                body: `${homeTeam} vs ${awayTeam}`,
                url: `/match/${fixtureId}`,
                tag: `kickoff-${fixtureId}`,
                fixtureId,
              });
              pushesSent++;
            }
          }
        }

        if (prev) {
          const wasLive = isLive(prev.status);
          const nowLive = isLive(currentStatus);

          if (!wasLive && nowLive) {
            for (const sub of subscribers) {
              if (sub.follow_type === "reminder") {
                const loc = sub.push_subscriptions.locale || "en";
                await sendPush(sub.push_subscriptions, {
                  title: PUSH_TEXTS.matchStarting[loc] || PUSH_TEXTS.matchStarting.en,
                  body: `${homeTeam} vs ${awayTeam}`,
                  url: `/match/${fixtureId}`,
                  tag: `kickoff-${fixtureId}`,
                  fixtureId,
                });
                pushesSent++;
              }
            }
          }

          if (homeGoals !== prev.home_goals || awayGoals !== prev.away_goals) {
            for (const sub of subscribers) {
              if (sub.follow_type === "goal_alert") {
                const loc = sub.push_subscriptions.locale || "en";
                const goalLabel = PUSH_TEXTS.goalScored[loc] || PUSH_TEXTS.goalScored.en;
                await sendPush(sub.push_subscriptions, {
                  title: `${goalLabel} — ${homeTeam} ${homeGoals}-${awayGoals} ${awayTeam}`,
                  body: `${homeTeam} ${homeGoals} - ${awayGoals} ${awayTeam}`,
                  url: `/match/${fixtureId}`,
                  tag: `goal-${fixtureId}-${homeGoals}-${awayGoals}`,
                  fixtureId,
                });
                pushesSent++;
              }
            }
          }
        }

        if (isFinished(currentStatus)) {
          finishedFixtures.push(fixtureId);
        }

        stateUpdates.push({
          fixture_id: fixtureId,
          home_goals: homeGoals,
          away_goals: awayGoals,
          status: currentStatus,
        });
      } catch (e) {
        console.error(`Error checking fixture ${fixtureId}:`, e);
      }
    }

    if (stateUpdates.length > 0) {
      for (const state of stateUpdates) {
        await supabase
          .from("match_push_states")
          .upsert(
            { ...state, updated_at: new Date().toISOString() },
            { onConflict: "fixture_id" }
          );
      }
    }

    if (finishedFixtures.length > 0) {
      await supabase
        .from("push_follows")
        .delete()
        .in("fixture_id", finishedFixtures);

      await supabase
        .from("match_push_states")
        .delete()
        .in("fixture_id", finishedFixtures);
    }

    return NextResponse.json({
      checked: uniqueFixtureIds.length,
      pushesSent,
      cleaned: finishedFixtures.length,
    });
  } catch (error) {
    console.error("Cron check-matches error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url: string; tag: string; fixtureId: number }
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
  } catch (err: unknown) {
    if (err && typeof err === "object" && "statusCode" in err) {
      const pushErr = err as { statusCode: number };
      if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }
}
