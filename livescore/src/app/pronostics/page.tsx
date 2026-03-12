"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";

interface AdminPrediction {
  id: string;
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  league_name: string | null;
  match_date: string | null;
  predicted_home: string;
  predicted_away: string;
  advice: string | null;
  prob_home: string | null;
  prob_draw: string | null;
  prob_away: string | null;
}

export default function PronosticsPage() {
  const { user } = useAuth();
  const { addReminder, removeReminder, hasReminder } = useNotifications();
  const { t, locale } = useTranslation();

  const [predictions, setPredictions] = useState<AdminPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/content/predictions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPredictions(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return predictions;
    const q = search.toLowerCase();
    return predictions.filter(
      (p) =>
        p.home_team.toLowerCase().includes(q) ||
        p.away_team.toLowerCase().includes(q) ||
        (p.league_name && p.league_name.toLowerCase().includes(q))
    );
  }, [predictions, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminPrediction[]>();
    for (const p of filtered) {
      const key = p.league_name || t("predictions.unknownLeague");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [filtered, t]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text">{t("predictions.title")}</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {t("predictions.subtitle")}
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("scores.searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {!loading && (
          <span className="text-xs text-text-muted flex-shrink-0">
            {filtered.length} {filtered.length !== 1 ? t("common.matches") : t("common.match")}
          </span>
        )}
      </div>

      {/* Locked overlay for non-logged-in users */}
      {!user && !loading && filtered.length > 0 && (
        <div className="relative mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 blur-[6px] pointer-events-none select-none" aria-hidden="true">
            {grouped.slice(0, 3).map(([league, preds]) => (
              <div key={league} className="flex flex-col">
                <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-t-xl border border-border">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-text truncate">{league}</span>
                </div>
                <div className="bg-white border-x border-b border-border rounded-b-xl overflow-hidden divide-y divide-border/50">
                  {preds.slice(0, 3).map((pred) => (
                    <div key={pred.fixture_id} className="flex items-center gap-2.5 px-3 py-2.5">
                      <span className="text-xs font-semibold text-primary w-12 text-center">{formatTime(pred.match_date)}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-text block truncate">{pred.home_team}</span>
                        <span className="text-xs font-medium text-text block truncate">{pred.away_team}</span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{pred.predicted_home} - {pred.predicted_away}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text mb-2">{t("predictions.locked")}</h3>
            <p className="text-sm text-text-muted max-w-md text-center mb-5 px-4">
              {t("predictions.lockedDesc")}
            </p>
            <div className="flex gap-3">
              <Link
                href="/auth/signin"
                className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors shadow-lg"
              >
                {t("predictions.signIn")}
              </Link>
              <Link
                href="/auth/signin?mode=signup"
                className="px-6 py-2.5 bg-white text-primary font-semibold text-sm rounded-lg border-2 border-primary hover:bg-primary/5 transition-colors"
              >
                {t("predictions.signUp")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {user && loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded bg-surface-light" />
                <div className="h-4 w-32 rounded bg-surface-light" />
              </div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-3 py-2.5 border-t border-border/50">
                  <div className="w-8 h-3 rounded bg-surface-light" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-surface-light" />
                    <div className="h-3 w-20 rounded bg-surface-light" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : user && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {search ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              )}
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">
            {search ? t("scores.noMatchesFound") : t("predictions.noPredictions")}
          </h3>
          <p className="text-sm text-text-muted max-w-xs">
            {search
              ? t("scores.noResultsFor", { query: search })
              : t("predictions.noPredictionsDesc")}
          </p>
        </div>
      ) : user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {grouped.map(([league, preds]) => (
            <div key={league} className="animate-slide-up flex flex-col">
              {/* League header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-t-xl border border-border">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-text truncate block">{league}</span>
                </div>
                <span className="text-[10px] text-text-muted bg-surface-hover px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                  {preds.length}
                </span>
              </div>

              {/* Predictions */}
              <div className="bg-white border-x border-b border-border rounded-b-xl overflow-hidden divide-y divide-border/50 flex-1">
                {preds.map((pred) => (
                  <Link
                    key={pred.fixture_id}
                    href={`/pronostics/${pred.fixture_id}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex flex-col items-center flex-shrink-0 w-12">
                      <span className="text-xs font-semibold text-primary">
                        {formatTime(pred.match_date)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {formatDate(pred.match_date)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {pred.home_logo && (
                          <div className="relative w-4 h-4 flex-shrink-0">
                            <Image src={pred.home_logo} alt={pred.home_team} fill className="object-contain" sizes="16px" unoptimized />
                          </div>
                        )}
                        <span className="text-xs font-medium text-text truncate">{pred.home_team}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {pred.away_logo && (
                          <div className="relative w-4 h-4 flex-shrink-0">
                            <Image src={pred.away_logo} alt={pred.away_team} fill className="object-contain" sizes="16px" unoptimized />
                          </div>
                        )}
                        <span className="text-xs font-medium text-text truncate">{pred.away_team}</span>
                      </div>
                    </div>

                    {/* Prediction badge */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {pred.predicted_home} - {pred.predicted_away}
                      </span>
                      {pred.advice && (
                        <span className="text-[10px] text-text-muted mt-0.5 max-w-[80px] truncate text-center">
                          {pred.advice}
                        </span>
                      )}
                    </div>

                    {user && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (hasReminder(pred.fixture_id)) {
                            removeReminder(pred.fixture_id);
                          } else {
                            addReminder({
                              fixture: { id: pred.fixture_id, referee: null, timezone: "UTC", date: pred.match_date || "", timestamp: 0, periods: { first: null, second: null }, venue: { id: null, name: null, city: null }, status: { short: "NS", long: "Not Started", elapsed: null, extra: null } },
                              teams: { home: { id: 0, name: pred.home_team, logo: pred.home_logo || "", winner: null }, away: { id: 0, name: pred.away_team, logo: pred.away_logo || "", winner: null } },
                              goals: { home: null, away: null },
                              league: { id: 0, name: pred.league_name || "", country: "", logo: "", flag: "", season: 0, round: "" },
                              score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null }, extratime: { home: null, away: null }, penalty: { home: null, away: null } },
                            });
                          }
                        }}
                        className={`flex-shrink-0 p-1 rounded-md transition-all ${
                          hasReminder(pred.fixture_id)
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                        title={hasReminder(pred.fixture_id) ? t("predictions.removeReminder") : t("predictions.remindKickoff")}
                      >
                        <svg className="w-4 h-4" fill={hasReminder(pred.fixture_id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                      </button>
                    )}

                    <svg className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
