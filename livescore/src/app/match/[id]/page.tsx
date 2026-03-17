"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import { Fixture, FixtureEvent } from "@/lib/types";
import { isLive, getStatusDisplay } from "@/lib/utils";
import SummaryTab from "@/components/match/SummaryTab";

interface PredictionData {
  predictions: {
    winner: { id: number; name: string; comment: string } | null;
    win_or_draw: boolean;
    under_over: string | null;
    goals: { home: string; away: string };
    advice: string;
    percent: { home: string; draw: string; away: string };
  };
  teams: {
    home: {
      id: number; name: string; logo: string;
      last_5: { form: string; att: string; def: string; goals: { for: { total: number; average: string }; against: { total: number; average: string } } };
    };
    away: {
      id: number; name: string; logo: string;
      last_5: { form: string; att: string; def: string; goals: { for: { total: number; average: string }; against: { total: number; average: string } } };
    };
  };
  comparison: Record<string, { home: string; away: string }>;
  h2h: Fixture[];
}

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useTranslation();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [events, setEvents] = useState<FixtureEvent[]>([]);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [lastHome, setLastHome] = useState<Fixture[]>([]);
  const [lastAway, setLastAway] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [fixtureRes, eventsRes, predRes] = await Promise.all([
          fetch(`/api/fixtures/${id}`),
          fetch(`/api/fixtures/${id}/events`),
          fetch(`/api/predictions/${id}`),
        ]);

        const [fixtureData, eventsData, predData] = await Promise.all([
          fixtureRes.json(),
          eventsRes.json(),
          predRes.json().catch(() => ({ response: [] })),
        ]);

        if (fixtureData.response?.[0]) setFixture(fixtureData.response[0]);
        if (eventsData.response) setEvents(eventsData.response);

        if (predData.response?.[0]) {
          const pred = predData.response[0];
          setPrediction(pred);

          const homeId = pred.teams.home.id;
          const awayId = pred.teams.away.id;
          const [homeLastRes, awayLastRes] = await Promise.all([
            fetch(`/api/fixtures?teamId=${homeId}&last=5`),
            fetch(`/api/fixtures?teamId=${awayId}&last=5`),
          ]);
          const [homeLastData, awayLastData] = await Promise.all([
            homeLastRes.json().catch(() => ({ response: [] })),
            awayLastRes.json().catch(() => ({ response: [] })),
          ]);
          if (homeLastData.response) setLastHome(homeLastData.response);
          if (awayLastData.response) setLastAway(awayLastData.response);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-surface-light rounded" />
          <div className="bg-surface rounded-2xl border border-border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-surface-light rounded-full" />
                <div className="h-5 w-32 bg-surface-light rounded" />
              </div>
              <div className="h-10 w-20 bg-surface-light rounded" />
              <div className="flex items-center gap-3">
                <div className="h-5 w-32 bg-surface-light rounded" />
                <div className="w-16 h-16 bg-surface-light rounded-full" />
              </div>
            </div>
          </div>
          <div className="h-12 bg-surface-light rounded-xl" />
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 bg-surface-light rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-text mb-2">{t("matchDetail.notFound")}</h2>
        <p className="text-text-muted mb-6">{t("matchDetail.notFoundDesc")}</p>
        <Link href="/scores" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
          {t("matchDetail.backToScores")}
        </Link>
      </div>
    );
  }

  const live = isLive(fixture.fixture.status.short);
  const statusText = getStatusDisplay(fixture, locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/scores"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t("matchDetail.backToScores")}
      </Link>

      <div className="flex items-center gap-2 flex-wrap">
        {fixture.league.flag && (
          <div className="relative w-5 h-3.5 rounded overflow-hidden flex-shrink-0">
            <Image src={fixture.league.flag} alt={fixture.league.country} fill className="object-cover" sizes="20px" unoptimized />
          </div>
        )}
        <div className="relative w-5 h-5 flex-shrink-0">
          <Image src={fixture.league.logo} alt={fixture.league.name} fill className="object-contain" sizes="20px" unoptimized />
        </div>
        <span className="text-xs text-text-muted uppercase tracking-wider">{fixture.league.country}</span>
        <span className="text-text-muted hidden sm:inline">·</span>
        <span className="text-sm font-medium text-text-secondary">{fixture.league.name}</span>
        <span className="text-text-muted hidden sm:inline">·</span>
        <span className="text-xs text-text-muted">{fixture.league.round}</span>
      </div>

      <div className={`relative bg-card rounded-2xl border overflow-hidden shadow-sm ${
        live ? "border-primary/30" : "border-border"
      }`}>
        {live && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} fill className="object-contain" sizes="80px" unoptimized />
              </div>
              <span className="text-sm md:text-base font-semibold text-text text-center leading-tight">
                {fixture.teams.home.name}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 px-4 md:px-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-5xl font-black text-score tabular-nums">
                  {fixture.goals.home ?? "-"}
                </span>
                <span className="text-2xl md:text-4xl font-light text-text-muted">-</span>
                <span className="text-3xl md:text-5xl font-black text-score tabular-nums">
                  {fixture.goals.away ?? "-"}
                </span>
              </div>

              {live ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-live" />
                  <span className="text-xs font-bold text-primary">{statusText}</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-text-muted px-3 py-1 bg-surface rounded-full">
                  {statusText}
                </span>
              )}

              {fixture.score.halftime.home !== null && (
                <span className="text-xs text-text-muted">
                  {t("matchDetail.halfTime")} {fixture.score.halftime.home} - {fixture.score.halftime.away}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} fill className="object-contain" sizes="80px" unoptimized />
              </div>
              <span className="text-sm md:text-base font-semibold text-text text-center leading-tight">
                {fixture.teams.away.name}
              </span>
            </div>
          </div>

          {fixture.fixture.venue.name && (
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-4 text-xs text-text-muted">
              <span>{fixture.fixture.venue.name}, {fixture.fixture.venue.city}</span>
              {fixture.fixture.referee && (
                <>
                  <span>·</span>
                  <span>{t("matchDetail.referee")} {fixture.fixture.referee}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary (events) */}
      <SummaryTab events={events} fixture={fixture} />

      {/* Analysis statistics */}
      <AnalysisSection prediction={prediction} lastHome={lastHome} lastAway={lastAway} t={t} locale={locale} />
    </div>
  );
}

/* ─── Analysis Section (always visible) ───────────────────────── */

function AnalysisSection({
  prediction, lastHome, lastAway, t, locale,
}: {
  prediction: PredictionData | null;
  lastHome: Fixture[];
  lastAway: Fixture[];
  t: (key: string, vars?: Record<string, string>) => string;
  locale: string;
}) {
  if (!prediction) return null;

  const pred = prediction.predictions;
  const comparisonKeys = prediction.comparison ? Object.keys(prediction.comparison) : [];
  const homeGoalsFor = prediction.teams.home.last_5?.goals?.for;
  const homeGoalsAgainst = prediction.teams.home.last_5?.goals?.against;
  const awayGoalsFor = prediction.teams.away.last_5?.goals?.for;
  const awayGoalsAgainst = prediction.teams.away.last_5?.goals?.against;
  const dateLocale = locale === "he" ? "he-IL" : locale === "ar" ? "ar-SA" : locale === "ru" ? "ru-RU" : "en-US";

  const homeTeamId = prediction.teams.home.id;
  const awayTeamId = prediction.teams.away.id;
  const homeFormResults = deriveForm(lastHome, homeTeamId);
  const awayFormResults = deriveForm(lastAway, awayTeamId);

  return (
    <div className="space-y-4">
      {/* Win Probability */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">{t("predictionDetail.winProbability")}</h3>
        <div className="space-y-3">
          <ProbBar label={t("predictionDetail.home")} value={pred.percent.home} color="bg-primary" />
          <ProbBar label={t("predictionDetail.draw")} value={pred.percent.draw} color="bg-text-muted/40" />
          <ProbBar label={t("predictionDetail.away")} value={pred.percent.away} color="bg-score" />
        </div>
        {pred.advice && (
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">{t("predictionDetail.expertAdvice")}</span>
            <p className="text-sm font-semibold text-text">{pred.advice}</p>
          </div>
        )}
      </div>

      {/* Recent Form + Comparison side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent form */}
        {(homeFormResults.length > 0 || awayFormResults.length > 0) && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text">{t("predictionDetail.recentForm")}</h3>
            </div>
            <div className="p-4 space-y-4">
              <FormRow teamName={prediction.teams.home.name} teamLogo={prediction.teams.home.logo} results={homeFormResults} />
              <FormRow teamName={prediction.teams.away.name} teamLogo={prediction.teams.away.logo} results={awayFormResults} />
            </div>
          </div>
        )}

        {/* Team Comparison */}
        {comparisonKeys.length > 0 && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text">{t("predictionDetail.teamComparison")}</h3>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/50">
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <Image src={prediction.teams.home.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                </div>
                <span className="text-xs font-semibold text-text">{prediction.teams.home.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">{prediction.teams.away.name}</span>
                <div className="relative w-4 h-4">
                  <Image src={prediction.teams.away.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                </div>
              </div>
            </div>
            <div className="divide-y divide-border/30">
              {comparisonKeys.map((key) => {
                const item = prediction.comparison[key];
                const homeVal = parseInt(item.home) || 0;
                const awayVal = parseInt(item.away) || 0;
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={key} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${homeVal >= awayVal ? "text-text" : "text-text-muted"}`}>{item.home}</span>
                      <span className="text-xs text-text-muted">{label}</span>
                      <span className={`text-sm font-semibold ${awayVal >= homeVal ? "text-text" : "text-text-muted"}`}>{item.away}</span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      <div className="flex-1 flex justify-end">
                        <div className={`h-full rounded-l-full ${homeVal >= awayVal ? "bg-primary" : "bg-surface-light"}`} style={{ width: item.home }} />
                      </div>
                      <div className="flex-1">
                        <div className={`h-full rounded-r-full ${awayVal >= homeVal ? "bg-score" : "bg-surface-light"}`} style={{ width: item.away }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Goals Last 5 */}
      {homeGoalsFor && awayGoalsFor && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t("predictionDetail.goalsLast5")}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GoalStatCard label={prediction.teams.home.name} subLabel={t("predictionDetail.scored")} value={homeGoalsFor.total} avg={homeGoalsFor.average} perMatch={t("predictionDetail.perMatch")} />
            <GoalStatCard label={prediction.teams.home.name} subLabel={t("predictionDetail.conceded")} value={homeGoalsAgainst?.total || 0} avg={homeGoalsAgainst?.average || "0"} perMatch={t("predictionDetail.perMatch")} />
            <GoalStatCard label={prediction.teams.away.name} subLabel={t("predictionDetail.scored")} value={awayGoalsFor.total} avg={awayGoalsFor.average} perMatch={t("predictionDetail.perMatch")} />
            <GoalStatCard label={prediction.teams.away.name} subLabel={t("predictionDetail.conceded")} value={awayGoalsAgainst?.total || 0} avg={awayGoalsAgainst?.average || "0"} perMatch={t("predictionDetail.perMatch")} />
          </div>
        </div>
      )}

      {/* H2H + Last Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {prediction.h2h && prediction.h2h.length > 0 && (
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text">{t("predictionDetail.headToHead")}</h3>
            </div>
            <div className="divide-y divide-border/50">
              {prediction.h2h.slice(0, 5).map((match: Fixture, idx: number) => {
                const date = new Date(match.fixture.date);
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2">
                    <span className="text-[10px] text-text-muted w-14 flex-shrink-0">
                      {date.toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "2-digit" })}
                    </span>
                    <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                      <span className={`text-xs truncate ${match.teams.home.winner ? "font-bold" : ""}`}>{match.teams.home.name}</span>
                      <div className="relative w-4 h-4 flex-shrink-0">
                        <Image src={match.teams.home.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                      </div>
                    </div>
                    <div className="px-1.5 py-0.5 bg-surface rounded text-xs font-bold text-text min-w-[36px] text-center">
                      {match.goals.home}-{match.goals.away}
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <div className="relative w-4 h-4 flex-shrink-0">
                        <Image src={match.teams.away.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                      </div>
                      <span className={`text-xs truncate ${match.teams.away.winner ? "font-bold" : ""}`}>{match.teams.away.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lastHome.length > 0 && (
          <LastMatchesCard teamName={prediction.teams.home.name} teamLogo={prediction.teams.home.logo} matches={lastHome} label={t("predictionDetail.lastMatches")} dateLocale={dateLocale} />
        )}
        {lastAway.length > 0 && (
          <LastMatchesCard teamName={prediction.teams.away.name} teamLogo={prediction.teams.away.logo} matches={lastAway} label={t("predictionDetail.lastMatches")} dateLocale={dateLocale} />
        )}
      </div>
    </div>
  );
}

/* ─── Shared sub-components ───────────────────────────────────── */

function ProbBar({ label, value, color }: { label: string; value: string; color: string }) {
  const numVal = parseInt(value) || 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-sm font-bold text-text">{value}</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${numVal}%` }} />
      </div>
    </div>
  );
}

function GoalStatCard({ label, subLabel, value, avg, perMatch }: { label: string; subLabel: string; value: number; avg: string; perMatch: string }) {
  return (
    <div className="bg-surface rounded-lg p-2.5 text-center">
      <div className="text-lg font-bold text-text">{value}</div>
      <div className="text-[10px] text-text-muted">{avg}{perMatch}</div>
      <div className="text-[10px] text-text-muted mt-1 truncate">{label} · {subLabel}</div>
    </div>
  );
}

function deriveForm(matches: Fixture[], teamId: number): string[] {
  return matches.slice(0, 5).map((m) => {
    const isHome = m.teams.home.id === teamId;
    const goalsFor = isHome ? m.goals.home : m.goals.away;
    const goalsAgainst = isHome ? m.goals.away : m.goals.home;
    if (goalsFor == null || goalsAgainst == null) return "D";
    if (goalsFor > goalsAgainst) return "W";
    if (goalsFor < goalsAgainst) return "L";
    return "D";
  });
}

function FormRow({ teamName, teamLogo, results }: { teamName: string; teamLogo: string; results: string[] }) {
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <div className="flex items-center gap-2 min-w-0 w-36">
        <div className="relative w-6 h-6 flex-shrink-0">
          <Image src={teamLogo} alt={teamName} fill className="object-contain" sizes="24px" unoptimized />
        </div>
        <span className="text-sm font-medium text-text truncate">{teamName}</span>
      </div>
      <div className="flex items-center gap-1">
        {results.map((r, i) => (
          <span
            key={i}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold text-white ${
              r === "W" ? "bg-green-500" : r === "L" ? "bg-primary" : "bg-text-muted"
            }`}
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function LastMatchesCard({ teamName, teamLogo, matches, label, dateLocale }: { teamName: string; teamLogo: string; matches: Fixture[]; label: string; dateLocale: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="relative w-5 h-5">
          <Image src={teamLogo} alt={teamName} fill className="object-contain" sizes="20px" unoptimized />
        </div>
        <h4 className="text-sm font-semibold text-text">{label}</h4>
      </div>
      <div className="divide-y divide-border/50">
        {matches.slice(0, 5).map((match, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-2 text-xs">
            <span className="text-text-muted w-14 flex-shrink-0">
              {new Date(match.fixture.date).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
            </span>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="relative w-4 h-4 flex-shrink-0">
                <Image src={match.teams.home.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
              </div>
              <span className="truncate">{match.teams.home.name}</span>
            </div>
            <span className="font-bold px-1">{match.goals.home}-{match.goals.away}</span>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="relative w-4 h-4 flex-shrink-0">
                <Image src={match.teams.away.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
              </div>
              <span className="truncate">{match.teams.away.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
