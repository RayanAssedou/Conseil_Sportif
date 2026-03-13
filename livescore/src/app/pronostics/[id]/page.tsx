"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fixture } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface Prediction {
  predictions: {
    winner: { id: number; name: string; comment: string } | null;
    win_or_draw: boolean;
    under_over: string | null;
    goals: { home: string; away: string };
    advice: string;
    percent: { home: string; draw: string; away: string };
  };
  league: { id: number; name: string; country: string; logo: string; flag: string };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      last_5: { form: string; att: string; def: string; goals: { for: { total: number; average: string }; against: { total: number; average: string } } };
    };
    away: {
      id: number;
      name: string;
      logo: string;
      last_5: { form: string; att: string; def: string; goals: { for: { total: number; average: string }; against: { total: number; average: string } } };
    };
  };
  comparison: Record<string, { home: string; away: string }>;
  h2h: Fixture[];
}

interface AdminPred {
  predicted_home: string;
  predicted_away: string;
  advice: string | null;
  prob_home: string | null;
  prob_draw: string | null;
  prob_away: string | null;
}

export default function PredictionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [adminPred, setAdminPred] = useState<AdminPred | null>(null);
  const [lastHome, setLastHome] = useState<Fixture[]>([]);
  const [lastAway, setLastAway] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [predRes, fixRes, adminPredRes] = await Promise.all([
          fetch(`/api/predictions/${id}`),
          fetch(`/api/fixtures/${id}`),
          fetch(`/api/content/predictions/${id}`),
        ]);

        const [predData, fixData, adminPredData] = await Promise.all([
          predRes.json(),
          fixRes.json(),
          adminPredRes.json().catch(() => null),
        ]);

        if (adminPredData && adminPredData.fixture_id) {
          setAdminPred(adminPredData);
        }

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

        if (fixData.response?.[0]) setFixture(fixData.response[0]);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [id]);

  if (!authLoading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">{t("predictions.locked")}</h2>
        <p className="text-text-muted mb-6 max-w-md mx-auto">{t("predictions.lockedDesc")}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/signin" className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors shadow-lg">
            {t("predictions.signIn")}
          </Link>
          <Link href="/auth/signin?mode=signup" className="px-6 py-2.5 bg-card text-primary font-semibold text-sm rounded-lg border-2 border-primary hover:bg-primary/5 transition-colors">
            {t("predictions.signUp")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-24 bg-surface-light rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-72 bg-surface-light rounded-2xl" />
            <div className="h-72 bg-surface-light rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-surface-light rounded-2xl" />
            <div className="h-48 bg-surface-light rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!prediction || !fixture) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-text mb-2">{t("predictionDetail.notAvailable")}</h2>
        <p className="text-text-muted mb-6">{t("predictionDetail.notAvailableYet")}</p>
        <Link href="/pronostics" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
          {t("predictionDetail.backToPredictions")}
        </Link>
      </div>
    );
  }

  const pred = prediction.predictions;
  const homeForm = prediction.teams.home.last_5?.form || "";
  const awayForm = prediction.teams.away.last_5?.form || "";
  const kickoff = new Date(fixture.fixture.date);
  const comparisonKeys = prediction.comparison ? Object.keys(prediction.comparison) : [];

  const pHome = adminPred?.prob_home || pred.percent.home;
  const pDraw = adminPred?.prob_draw || pred.percent.draw;
  const pAway = adminPred?.prob_away || pred.percent.away;

  const homeGoalsFor = prediction.teams.home.last_5?.goals?.for;
  const homeGoalsAgainst = prediction.teams.home.last_5?.goals?.against;
  const awayGoalsFor = prediction.teams.away.last_5?.goals?.for;
  const awayGoalsAgainst = prediction.teams.away.last_5?.goals?.against;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Back + league */}
      <div className="flex items-center justify-between">
        <Link
          href="/pronostics"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t("predictionDetail.backToPredictions")}
        </Link>
        <div className="flex items-center gap-2">
          {prediction.league.flag && (
            <div className="relative w-5 h-3.5 rounded overflow-hidden">
              <Image src={prediction.league.flag} alt={prediction.league.country} fill className="object-cover" sizes="20px" unoptimized />
            </div>
          )}
          <div className="relative w-5 h-5">
            <Image src={prediction.league.logo} alt={prediction.league.name} fill className="object-contain" sizes="20px" unoptimized />
          </div>
          <span className="text-xs text-text-muted uppercase tracking-wider">{prediction.league.country}</span>
          <span className="text-text-muted">·</span>
          <span className="text-sm font-medium text-text-secondary">{prediction.league.name}</span>
        </div>
      </div>

      {/* HAML AI Banner */}
      <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-violet-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18 7.5l.442 1.381a2.25 2.25 0 001.427 1.427L21.25 10.75l-1.381.442a2.25 2.25 0 00-1.427 1.427L18 14l-.442-1.381a2.25 2.25 0 00-1.427-1.427L14.75 10.75l1.381-.442a2.25 2.25 0 001.427-1.427L18 7.5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">{t("ai.poweredBy")}</span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{t("ai.description")}</p>
          </div>
        </div>
      </div>

      {/* Row 1: Match header + Score + Probability side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Match header + Predicted Score (2/3) */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="relative w-14 h-14 md:w-16 md:h-16">
                  <Image src={prediction.teams.home.logo} alt={prediction.teams.home.name} fill className="object-contain" sizes="64px" unoptimized />
                </div>
                <span className="text-sm font-semibold text-text text-center">{prediction.teams.home.name}</span>
              </div>

              <div className="flex flex-col items-center gap-1 px-4">
                <span className="text-xs text-text-muted">
                  {kickoff.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="text-lg font-bold text-text">
                  {kickoff.toLocaleTimeString(locale === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{t("predictionDetail.kickoff")}</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="relative w-14 h-14 md:w-16 md:h-16">
                  <Image src={prediction.teams.away.logo} alt={prediction.teams.away.name} fill className="object-contain" sizes="64px" unoptimized />
                </div>
                <span className="text-sm font-semibold text-text text-center">{prediction.teams.away.name}</span>
              </div>
            </div>

            {/* Predicted score */}
            <div className="bg-surface rounded-xl p-4 mb-3">
              <div className="text-center mb-2 flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{t("predictionDetail.predictedScore")}</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
                  <svg className="w-2.5 h-2.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <span className="text-[9px] font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">{t("ai.badge")}</span>
                </span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl font-black text-text">{adminPred ? adminPred.predicted_home : (pred.goals.home || "?")}</span>
                <span className="text-2xl font-light text-text-muted">-</span>
                <span className="text-4xl font-black text-text">{adminPred ? adminPred.predicted_away : (pred.goals.away || "?")}</span>
              </div>
            </div>

            {/* Advice */}
            {(adminPred?.advice || pred.advice) && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">{t("predictionDetail.expertAdvice")}</span>
                <p className="text-sm font-semibold text-text">{adminPred?.advice || pred.advice}</p>
              </div>
            )}
          </div>
        </div>

        {/* Probability + Quick Stats (1/3) */}
        <div className="space-y-4">
          {/* Win probability */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("predictionDetail.winProbability")}</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                <svg className="w-2 h-2 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="text-[8px] font-bold text-violet-500">AI</span>
              </span>
            </div>
            <div className="space-y-3">
              <ProbBar label={t("predictionDetail.home")} value={pHome} color="bg-primary" />
              <ProbBar label={t("predictionDetail.draw")} value={pDraw} color="bg-text-muted/40" />
              <ProbBar label={t("predictionDetail.away")} value={pAway} color="bg-score" />
            </div>
          </div>

          {/* Goal stats */}
          {homeGoalsFor && awayGoalsFor && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t("predictionDetail.goalsLast5")}</div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label={prediction.teams.home.name} subLabel={t("predictionDetail.scored")} value={homeGoalsFor.total} avg={homeGoalsFor.average} perMatch={t("predictionDetail.perMatch")} />
                <StatCard label={prediction.teams.home.name} subLabel={t("predictionDetail.conceded")} value={homeGoalsAgainst?.total || 0} avg={homeGoalsAgainst?.average || "0"} perMatch={t("predictionDetail.perMatch")} />
                <StatCard label={prediction.teams.away.name} subLabel={t("predictionDetail.scored")} value={awayGoalsFor.total} avg={awayGoalsFor.average} perMatch={t("predictionDetail.perMatch")} />
                <StatCard label={prediction.teams.away.name} subLabel={t("predictionDetail.conceded")} value={awayGoalsAgainst?.total || 0} avg={awayGoalsAgainst?.average || "0"} perMatch={t("predictionDetail.perMatch")} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Form + Comparison side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent form */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">{t("predictionDetail.recentForm")}</h3>
          </div>
          <div className="p-4 space-y-4">
            <FormRow teamName={prediction.teams.home.name} teamLogo={prediction.teams.home.logo} form={homeForm} />
            <FormRow teamName={prediction.teams.away.name} teamLogo={prediction.teams.away.logo} form={awayForm} />
          </div>
        </div>

        {/* Comparison */}
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
                      <span className={`text-sm font-semibold ${homeVal >= awayVal ? "text-text" : "text-text-muted"}`}>
                        {item.home}
                      </span>
                      <span className="text-xs text-text-muted">{label}</span>
                      <span className={`text-sm font-semibold ${awayVal >= homeVal ? "text-text" : "text-text-muted"}`}>
                        {item.away}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      <div className="flex-1 flex justify-end">
                        <div
                          className={`h-full rounded-l-full ${homeVal >= awayVal ? "bg-primary" : "bg-surface-light"}`}
                          style={{ width: item.home }}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`h-full rounded-r-full ${awayVal >= homeVal ? "bg-score" : "bg-surface-light"}`}
                          style={{ width: item.away }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: H2H + Last matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Head to Head */}
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
                      {date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { month: "short", day: "numeric", year: "2-digit" })}
                    </span>
                    <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                      <span className={`text-xs truncate ${match.teams.home.winner ? "font-bold" : ""}`}>
                        {match.teams.home.name}
                      </span>
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
                      <span className={`text-xs truncate ${match.teams.away.winner ? "font-bold" : ""}`}>
                        {match.teams.away.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last matches */}
        {lastHome.length > 0 && (
          <LastMatchesCard teamName={prediction.teams.home.name} teamLogo={prediction.teams.home.logo} matches={lastHome} lastMatchesLabel={t("predictionDetail.lastMatches")} locale={locale} />
        )}
        {lastAway.length > 0 && (
          <LastMatchesCard teamName={prediction.teams.away.name} teamLogo={prediction.teams.away.logo} matches={lastAway} lastMatchesLabel={t("predictionDetail.lastMatches")} locale={locale} />
        )}
      </div>
    </div>
  );
}

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

function StatCard({ label, subLabel, value, avg, perMatch }: { label: string; subLabel: string; value: number; avg: string; perMatch: string }) {
  return (
    <div className="bg-surface rounded-lg p-2.5 text-center">
      <div className="text-lg font-bold text-text">{value}</div>
      <div className="text-[10px] text-text-muted">{avg}{perMatch}</div>
      <div className="text-[10px] text-text-muted mt-1 truncate">{label} · {subLabel}</div>
    </div>
  );
}

function FormRow({ teamName, teamLogo, form }: { teamName: string; teamLogo: string; form: string }) {
  const results = form.split("");
  return (
    <div className="flex items-center gap-3">
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

function LastMatchesCard({ teamName, teamLogo, matches, lastMatchesLabel, locale }: { teamName: string; teamLogo: string; matches: Fixture[]; lastMatchesLabel: string; locale: string }) {
  const dateLocale = locale === "he" ? "he-IL" : "en-US";
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="relative w-5 h-5">
          <Image src={teamLogo} alt={teamName} fill className="object-contain" sizes="20px" unoptimized />
        </div>
        <h4 className="text-sm font-semibold text-text">{lastMatchesLabel}</h4>
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
