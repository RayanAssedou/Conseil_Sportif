import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";
import { fetchFixtureById, fetchFixtureEvents } from "@/lib/api";
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
  events_count: number;
}

interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
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
  yellowCard: {
    en: "🟨 Yellow Card",
    he: "🟨 כרטיס צהוב",
    ar: "🟨 بطاقة صفراء",
    ru: "🟨 Жёлтая карточка",
  },
  redCard: {
    en: "🟥 RED CARD",
    he: "🟥 כרטיס אדום",
    ar: "🟥 بطاقة حمراء",
    ru: "🟥 КРАСНАЯ КАРТОЧКА",
  },
  substitution: {
    en: "🔄 Substitution",
    he: "🔄 חילוף",
    ar: "🔄 تبديل",
    ru: "🔄 Замена",
  },
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHECK_INTERVAL_MS = 8_000;
const MAX_ROUNDS = 6;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let totalPushesSent = 0;
  let totalCleaned = 0;
  let totalChecked = 0;
  let rounds = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    if (round > 0) await sleep(CHECK_INTERVAL_MS);
    rounds++;

    try {
      const result = await runCheck();
      totalPushesSent += result.pushesSent;
      totalCleaned += result.cleaned;
      totalChecked = result.checked;

      if (result.checked === 0) break;
    } catch (error) {
      console.error(`Cron round ${round} error:`, error);
    }
  }

  return NextResponse.json({
    rounds,
    checked: totalChecked,
    pushesSent: totalPushesSent,
    cleaned: totalCleaned,
  });
}

async function runCheck() {
  const { data: follows, error: followsErr } = await supabase
    .from("push_follows")
    .select("fixture_id, follow_type, push_subscriptions(id, endpoint, p256dh, auth, locale)");

  if (followsErr || !follows || follows.length === 0) {
    return { checked: 0, pushesSent: 0, cleaned: 0 };
  }

  const uniqueFixtureIds = [...new Set((follows as unknown as FollowRow[]).map((f) => f.fixture_id))];

  const { data: existingStates } = await supabase
    .from("match_push_states")
    .select("*")
    .in("fixture_id", uniqueFixtureIds);

  const stateMap = new Map<number, MatchState>();
  if (existingStates) {
    for (const s of existingStates) {
      stateMap.set(s.fixture_id, { ...s, events_count: s.events_count ?? 0 });
    }
  }

  let pushesSent = 0;
  const finishedFixtures: number[] = [];
  const stateUpdates: MatchState[] = [];

  for (const fixtureId of uniqueFixtureIds) {
    try {
      const [fixtureData, eventsData] = await Promise.all([
        fetchFixtureById(String(fixtureId), { skipCache: true }),
        fetchFixtureEvents(String(fixtureId), { skipCache: true }),
      ]);

      const fixture = fixtureData?.response?.[0];
      if (!fixture) continue;

      const events: MatchEvent[] = eventsData?.response || [];
      const currentStatus = fixture.fixture.status.short;
      const homeGoals = fixture.goals.home ?? 0;
      const awayGoals = fixture.goals.away ?? 0;
      const homeTeam = fixture.teams.home.name;
      const awayTeam = fixture.teams.away.name;
      const matchLabel = `${homeTeam} vs ${awayTeam}`;

      const prev = stateMap.get(fixtureId);

      const goalAlertSubs = (follows as unknown as FollowRow[]).filter(
        (f) => f.fixture_id === fixtureId && f.follow_type === "goal_alert"
      );
      const reminderSubs = (follows as unknown as FollowRow[]).filter(
        (f) => f.fixture_id === fixtureId && f.follow_type === "reminder"
      );

      const justStarted = (!prev && isLive(currentStatus)) ||
        (prev && !isLive(prev.status) && isLive(currentStatus));

      if (justStarted) {
        for (const sub of reminderSubs) {
          const loc = sub.push_subscriptions.locale || "en";
          await sendPush(sub.push_subscriptions, {
            title: PUSH_TEXTS.matchStarting[loc] || PUSH_TEXTS.matchStarting.en,
            body: matchLabel,
            url: `/match/${fixtureId}`,
            tag: `kickoff-${fixtureId}`,
            fixtureId,
          });
          pushesSent++;
        }
      }

      if (prev && (homeGoals !== prev.home_goals || awayGoals !== prev.away_goals)) {
        for (const sub of goalAlertSubs) {
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

      const prevEventsCount = prev?.events_count ?? 0;
      if (events.length > prevEventsCount && goalAlertSubs.length > 0) {
        const newEvents = events.slice(prevEventsCount);
        for (const evt of newEvents) {
          let titleKey: string | null = null;
          let body = "";

          if (evt.type === "Card" && evt.detail?.includes("Yellow")) {
            titleKey = "yellowCard";
            body = `${evt.player?.name || "?"} — ${evt.team?.name || ""} (${evt.time?.elapsed || "?"}\')`;
          } else if (evt.type === "Card" && (evt.detail?.includes("Red") || evt.detail?.includes("Second Yellow"))) {
            titleKey = "redCard";
            body = `${evt.player?.name || "?"} — ${evt.team?.name || ""} (${evt.time?.elapsed || "?"}\')`;
          } else if (evt.type === "subst") {
            titleKey = "substitution";
            body = `${evt.player?.name || "?"} ➜ ${evt.assist?.name || "?"} — ${evt.team?.name || ""} (${evt.time?.elapsed || "?"}\')`;
          }

          if (titleKey) {
            for (const sub of goalAlertSubs) {
              const loc = sub.push_subscriptions.locale || "en";
              const label = PUSH_TEXTS[titleKey]?.[loc] || PUSH_TEXTS[titleKey]?.en || titleKey;
              await sendPush(sub.push_subscriptions, {
                title: `${label} — ${matchLabel}`,
                body,
                url: `/match/${fixtureId}`,
                tag: `${titleKey}-${fixtureId}-${events.length}`,
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

      const newState: MatchState = {
        fixture_id: fixtureId,
        home_goals: homeGoals,
        away_goals: awayGoals,
        status: currentStatus,
        events_count: events.length,
      };
      stateUpdates.push(newState);
      stateMap.set(fixtureId, newState);
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

  return { checked: uniqueFixtureIds.length, pushesSent, cleaned: finishedFixtures.length };
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
