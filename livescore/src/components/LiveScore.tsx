"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Fixture, LeagueGroup, MatchStatus } from "@/lib/types";
import { groupFixturesByLeague, isLive, isFinished, isUpcoming, getDateOffset, PRIORITY_LEAGUES } from "@/lib/utils";
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
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const leagueRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) setShowLeagueDropdown(false);
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) setShowTeamDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const leagueFiltered = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return fixtures.filter((f) => {
      if (isFinished(f.fixture.status.short)) {
        return new Date(f.fixture.date).getTime() >= cutoff;
      }
      return true;
    });
  }, [fixtures]);

  const availableLeagues = useMemo(() => {
    const LEAGUE_META: Record<number, { name: string; country: string }> = {
      2: { name: "UEFA Champions League", country: "Europe" },
      3: { name: "UEFA Europa League", country: "Europe" },
      848: { name: "UEFA Conference League", country: "Europe" },
      39: { name: "Premier League", country: "England" },
      140: { name: "La Liga", country: "Spain" },
      135: { name: "Serie A", country: "Italy" },
      78: { name: "Bundesliga", country: "Germany" },
      61: { name: "Ligue 1", country: "France" },
      94: { name: "Primeira Liga", country: "Portugal" },
      88: { name: "Eredivisie", country: "Netherlands" },
      203: { name: "Süper Lig", country: "Turkey" },
      144: { name: "Jupiler Pro League", country: "Belgium" },
      235: { name: "Premier League", country: "Russia" },
      307: { name: "Saudi Pro League", country: "Saudi Arabia" },
      1: { name: "FIFA World Cup", country: "World" },
      4: { name: "UEFA Euro", country: "Europe" },
      9: { name: "Copa America", country: "South America" },
      15: { name: "Africa Cup of Nations", country: "Africa" },
      253: { name: "MLS", country: "USA" },
      71: { name: "Serie A", country: "Brazil" },
      383: { name: "Ligat Ha'al", country: "Israel" },
    };
    const logoUrl = (id: number) => `https://media.api-sports.io/football/leagues/${id}.png`;

    const map = new Map<number, { id: number; name: string; logo: string; country: string; count: number }>();

    for (const lid of PRIORITY_LEAGUES) {
      const meta = LEAGUE_META[lid];
      if (meta) {
        map.set(lid, { id: lid, name: meta.name, logo: logoUrl(lid), country: meta.country, count: 0 });
      }
    }

    for (const f of leagueFiltered) {
      const existing = map.get(f.league.id);
      if (existing) {
        existing.count++;
        existing.name = f.league.name;
        existing.logo = f.league.logo;
        existing.country = f.league.country;
      } else {
        map.set(f.league.id, { id: f.league.id, name: f.league.name, logo: f.league.logo, country: f.league.country, count: 1 });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const aPri = PRIORITY_LEAGUES.indexOf(a.id);
      const bPri = PRIORITY_LEAGUES.indexOf(b.id);
      const aIdx = aPri === -1 ? 999 : aPri;
      const bIdx = bPri === -1 ? 999 : bPri;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.name.localeCompare(b.name);
    });
  }, [leagueFiltered]);

  const availableTeams = useMemo(() => {
    const map = new Map<number, { id: number; name: string; logo: string }>();
    const source = selectedLeague ? leagueFiltered.filter((f) => f.league.id === selectedLeague) : leagueFiltered;
    for (const f of source) {
      if (!map.has(f.teams.home.id)) map.set(f.teams.home.id, { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo });
      if (!map.has(f.teams.away.id)) map.set(f.teams.away.id, { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [leagueFiltered, selectedLeague]);

  const filteredFixtures = useMemo(() => {
    return leagueFiltered.filter((f) => {
      if (selectedLeague && f.league.id !== selectedLeague) return false;
      if (selectedTeam && f.teams.home.id !== selectedTeam && f.teams.away.id !== selectedTeam) return false;
      if (statusFilter === "live") return isLive(f.fixture.status.short);
      if (statusFilter === "finished") return isFinished(f.fixture.status.short);
      if (statusFilter === "upcoming") return isUpcoming(f.fixture.status.short);
      return true;
    });
  }, [leagueFiltered, selectedLeague, selectedTeam, statusFilter]);

  const liveCounts = useMemo(() => {
    const base = leagueFiltered.filter((f) => {
      if (selectedLeague && f.league.id !== selectedLeague) return false;
      if (selectedTeam && f.teams.home.id !== selectedTeam && f.teams.away.id !== selectedTeam) return false;
      return true;
    });
    return {
      live: base.filter((f) => isLive(f.fixture.status.short)).length,
      finished: base.filter((f) => isFinished(f.fixture.status.short)).length,
      upcoming: base.filter((f) => isUpcoming(f.fixture.status.short)).length,
      all: base.length,
    };
  }, [leagueFiltered, selectedLeague, selectedTeam]);

  const groups: LeagueGroup[] = groupFixturesByLeague(filteredFixtures, allowedLeagues);

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
  const selectedLeagueData = availableLeagues.find((l) => l.id === selectedLeague);
  const selectedTeamData = availableTeams.find((t) => t.id === selectedTeam);
  const hasActiveFilters = selectedLeague !== null || selectedTeam !== null;

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

        <div className="flex flex-col gap-3">
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

          {/* League & Team filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* League filter */}
            <div className="relative" ref={leagueRef}>
              <button
                onClick={() => { setShowLeagueDropdown(!showLeagueDropdown); setShowTeamDropdown(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedLeague
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-text-muted hover:text-text hover:border-text-muted"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.84m0 0v.344a4.5 4.5 0 01-.972 2.788M12 14.25v.344a4.5 4.5 0 00.972 2.788" />
                </svg>
                {selectedLeagueData ? (
                  <span className="flex items-center gap-1.5">
                    <span className="relative w-4 h-4 flex-shrink-0">
                      <Image src={selectedLeagueData.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                    </span>
                    <span className="max-w-[120px] truncate">{selectedLeagueData.name}</span>
                  </span>
                ) : (
                  <span>{t("scores.leagues")}</span>
                )}
                <svg className={`w-3 h-3 transition-transform ${showLeagueDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showLeagueDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 max-h-80 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50">
                  <button
                    onClick={() => { setSelectedLeague(null); setSelectedTeam(null); setShowLeagueDropdown(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${!selectedLeague ? "bg-primary/10 text-primary font-semibold" : "text-text hover:bg-surface"}`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded bg-surface text-xs">★</span>
                    {t("scores.allLeagues")}
                  </button>
                  {availableLeagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => { setSelectedLeague(league.id); setSelectedTeam(null); setShowLeagueDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${selectedLeague === league.id ? "bg-primary/10 text-primary font-semibold" : "text-text hover:bg-surface"}`}
                    >
                      <span className="relative w-5 h-5 flex-shrink-0">
                        <Image src={league.logo} alt="" fill className="object-contain" sizes="20px" unoptimized />
                      </span>
                      <span className="flex-1 text-left truncate">{league.name}</span>
                      <span className="text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded">{league.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Team filter */}
            <div className="relative" ref={teamRef}>
              <button
                onClick={() => { setShowTeamDropdown(!showTeamDropdown); setShowLeagueDropdown(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedTeam
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-text-muted hover:text-text hover:border-text-muted"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                {selectedTeamData ? (
                  <span className="flex items-center gap-1.5">
                    <span className="relative w-4 h-4 flex-shrink-0">
                      <Image src={selectedTeamData.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                    </span>
                    <span className="max-w-[120px] truncate">{selectedTeamData.name}</span>
                  </span>
                ) : (
                  <span>{t("scores.teams")}</span>
                )}
                <svg className={`w-3 h-3 transition-transform ${showTeamDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showTeamDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 max-h-80 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50">
                  <button
                    onClick={() => { setSelectedTeam(null); setShowTeamDropdown(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${!selectedTeam ? "bg-primary/10 text-primary font-semibold" : "text-text hover:bg-surface"}`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded bg-surface text-xs">★</span>
                    {t("scores.allTeams")}
                  </button>
                  {availableTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => { setSelectedTeam(team.id); setShowTeamDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${selectedTeam === team.id ? "bg-primary/10 text-primary font-semibold" : "text-text hover:bg-surface"}`}
                    >
                      <span className="relative w-5 h-5 flex-shrink-0">
                        <Image src={team.logo} alt="" fill className="object-contain" sizes="20px" unoptimized />
                      </span>
                      <span className="flex-1 text-left truncate">{team.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => { setSelectedLeague(null); setSelectedTeam(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t("scores.clearFilters")}
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
