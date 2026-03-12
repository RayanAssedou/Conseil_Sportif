"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

const API = (path: string) => `/api${path}`;
const fetchOpts = { credentials: "include" as RequestCredentials };

interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  matchCount: number;
}

const POPULAR_LEAGUES = [
  { id: 39, name: "Premier League", country: "England" },
  { id: 140, name: "La Liga", country: "Spain" },
  { id: 135, name: "Serie A", country: "Italy" },
  { id: 78, name: "Bundesliga", country: "Germany" },
  { id: 61, name: "Ligue 1", country: "France" },
  { id: 2, name: "Champions League", country: "World" },
  { id: 3, name: "Europa League", country: "World" },
  { id: 848, name: "Conference League", country: "World" },
  { id: 1, name: "World Cup", country: "World" },
  { id: 4, name: "Euro Championship", country: "World" },
  { id: 9, name: "Copa America", country: "World" },
  { id: 10, name: "Friendlies", country: "World" },
  { id: 143, name: "Copa del Rey", country: "Spain" },
  { id: 45, name: "FA Cup", country: "England" },
  { id: 48, name: "League Cup", country: "England" },
  { id: 137, name: "Coppa Italia", country: "Italy" },
  { id: 65, name: "Coupe de France", country: "France" },
  { id: 81, name: "DFB Pokal", country: "Germany" },
  { id: 94, name: "Primeira Liga", country: "Portugal" },
  { id: 88, name: "Eredivisie", country: "Netherlands" },
  { id: 144, name: "Belgian Pro League", country: "Belgium" },
  { id: 203, name: "Super Lig", country: "Turkey" },
  { id: 218, name: "Tippeligaen", country: "Norway" },
  { id: 113, name: "Allsvenskan", country: "Sweden" },
  { id: 169, name: "Super League", country: "China" },
  { id: 253, name: "MLS", country: "USA" },
  { id: 71, name: "Serie A", country: "Brazil" },
  { id: 128, name: "Liga Profesional Argentina", country: "Argentina" },
  { id: 307, name: "Saudi Pro League", country: "Saudi-Arabia" },
  { id: 233, name: "Premier League", country: "Egypt" },
];

export default function AdminLeaguesPage() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [liveLeagues, setLiveLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"popular" | "live">("popular");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedRes, fixturesRes] = await Promise.all([
          fetch(API("/admin/leagues"), fetchOpts).then((r) => r.json()),
          fetch(API("/fixtures?date=" + new Date().toISOString().split("T")[0])).then((r) => r.json()),
        ]);

        if (savedRes.league_ids) {
          setSelectedIds(new Set(savedRes.league_ids));
        }

        if (fixturesRes.response) {
          const leagueMap = new Map<number, League>();
          for (const f of fixturesRes.response) {
            const lid = f.league.id;
            if (leagueMap.has(lid)) {
              leagueMap.get(lid)!.matchCount++;
            } else {
              leagueMap.set(lid, {
                id: lid,
                name: f.league.name,
                country: f.league.country,
                logo: f.league.logo,
                flag: f.league.flag,
                matchCount: 1,
              });
            }
          }
          setLiveLeagues(Array.from(leagueMap.values()).sort((a, b) => b.matchCount - a.matchCount));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  };

  const selectAll = (ids: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    setSaved(false);
  };

  const deselectAll = (ids: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(API("/admin/leagues"), {
        method: "PUT",
        ...fetchOpts,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ league_ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const popularFiltered = useMemo(() => {
    if (!search.trim()) return POPULAR_LEAGUES;
    const q = search.toLowerCase();
    return POPULAR_LEAGUES.filter(
      (l) => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q)
    );
  }, [search]);

  const liveFiltered = useMemo(() => {
    if (!search.trim()) return liveLeagues;
    const q = search.toLowerCase();
    return liveLeagues.filter(
      (l) => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q)
    );
  }, [search, liveLeagues]);

  const currentList = tab === "popular" ? popularFiltered : liveFiltered;
  const currentIds = currentList.map((l) => l.id);
  const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id));

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Displayed Leagues</h1>
          <p className="text-sm text-slate-500 mt-1">
            Select which leagues appear in Live Scores & Predictions.
            {selectedIds.size > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                {selectedIds.size} selected
              </span>
            )}
            {selectedIds.size === 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
                All leagues shown
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : "Save Selection"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved
            </span>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> If no leagues are selected, all leagues will be displayed. Select specific leagues to filter what users see on Live Scores and Predictions pages.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setTab("popular")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === "popular" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Popular Leagues
          </button>
          <button
            onClick={() => setTab("live")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === "live" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Today&apos;s Leagues
            {liveLeagues.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 font-bold rounded">
                {liveLeagues.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leagues..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
          />
        </div>

        <button
          onClick={() => allSelected ? deselectAll(currentIds) : selectAll(currentIds)}
          className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">
            {search ? `No leagues matching "${search}"` : "No leagues available today."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentList.map((league) => {
            const selected = selectedIds.has(league.id);
            const l = "logo" in league ? (league as League) : null;
            return (
              <button
                key={league.id}
                onClick={() => toggle(league.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selected
                    ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? "bg-emerald-500" : "border-2 border-slate-300"
                }`}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>

                {l?.logo ? (
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image src={l.logo} alt="" fill className="object-contain" sizes="32px" unoptimized />
                  </div>
                ) : (
                  <div className="w-8 h-8 flex-shrink-0 rounded bg-slate-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0m5.54 0L12 17.25l-4.77-7.522" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{league.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{league.country}</span>
                    {l && l.matchCount > 0 && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {l.matchCount} match{l.matchCount > 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">#{league.id}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
