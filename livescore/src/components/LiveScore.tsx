"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Fixture, LeagueGroup, MatchStatus } from "@/lib/types";
import { groupFixturesByLeague, isLive, isFinished, isUpcoming, getDateOffset } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";
import StatusFilter from "./StatusFilter";
import LeagueSection from "./LeagueSection";

export default function LiveScore() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MatchStatus>("all");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [allowedLeagues, setAllowedLeagues] = useState<Set<number> | null>(null);
  const { checkGoalUpdates } = useNotifications();
  const { t, locale } = useTranslation();

  const today = getDateOffset(0);

  useEffect(() => {
    fetch("/api/content/leagues")
      .then((r) => r.json())
      .then((d) => {
        const ids: number[] = d.league_ids || [];
        setAllowedLeagues(ids.length > 0 ? new Set(ids) : null);
      })
      .catch(() => setAllowedLeagues(null));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/fixtures?date=${today}`);
      const data = await res.json();
      if (data.response) {
        setFixtures(data.response);
        checkGoalUpdates(data.response);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [today, checkGoalUpdates]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const leagueFiltered = allowedLeagues
    ? fixtures.filter((f) => allowedLeagues.has(f.league.id))
    : fixtures;

  const filteredFixtures = leagueFiltered.filter((f) => {
    if (statusFilter === "live") return isLive(f.fixture.status.short);
    if (statusFilter === "finished") return isFinished(f.fixture.status.short);
    if (statusFilter === "upcoming") return isUpcoming(f.fixture.status.short);
    return true;
  });

  const liveCounts = {
    live: leagueFiltered.filter((f) => isLive(f.fixture.status.short)).length,
    finished: leagueFiltered.filter((f) => isFinished(f.fixture.status.short)).length,
    upcoming: leagueFiltered.filter((f) => isUpcoming(f.fixture.status.short)).length,
    all: leagueFiltered.length,
  };

  const groups: LeagueGroup[] = groupFixturesByLeague(filteredFixtures);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        fixtures: g.fixtures.filter(
          (f) =>
            f.teams.home.name.toLowerCase().includes(q) ||
            f.teams.away.name.toLowerCase().includes(q) ||
            g.league.name.toLowerCase().includes(q) ||
            g.league.country.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.fixtures.length > 0);
  }, [groups, search]);

  const totalMatches = filteredGroups.reduce((s, g) => s + g.fixtures.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text">{t("scores.title")}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {t("scores.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {t("scores.updated")} {lastUpdate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <StatusFilter status={statusFilter} onChange={setStatusFilter} liveCounts={liveCounts} />
          </div>

          <div className="relative w-full sm:w-72 flex-shrink-0">
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
        </div>
      </div>

      {search.trim() && !loading && (
        <p className="text-xs text-text-muted mb-3">
          {totalMatches} {totalMatches !== 1 ? t("common.matches") : t("common.match")} {t("common.found")}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-surface-light animate-pulse" />
                <div className="h-4 w-32 rounded bg-surface-light animate-pulse" />
              </div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="px-4 py-3 border-t border-border/50 flex items-center gap-3">
                  <div className="w-12 h-4 rounded bg-surface-light animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-surface-light animate-pulse" />
                      <div className="h-3 w-24 rounded bg-surface-light animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-surface-light animate-pulse" />
                      <div className="h-3 w-20 rounded bg-surface-light animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {search ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">
            {t("scores.noMatchesFound")}
          </h3>
          <p className="text-sm text-text-muted max-w-xs">
            {search
              ? t("scores.noResultsFor", { query: search })
              : statusFilter === "live"
                ? t("scores.noLiveNow")
                : t("scores.noMatchesDate")}
          </p>
        </div>
      ) : (
        <>
          {liveCounts.live > 0 && statusFilter === "all" && !search && (
            <div className="flex items-center gap-2 px-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {liveCounts.live} {liveCounts.live > 1 ? t("common.matches") : t("common.match")} live
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <LeagueSection key={group.league.id} group={group} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
