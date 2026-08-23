"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

const API = (path: string) => `/api${path}`;
const fetchOpts = { credentials: "include" as RequestCredentials };

interface FixtureData {
  fixture: { id: number; date: string; status: { short: string } };
  league: { id: number; name: string; country: string; logo: string; flag: string | null };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
}

interface LeagueGroup {
  league: FixtureData["league"];
  fixtures: FixtureData[];
}

interface DailyTip {
  featured_fixture_id: number | null;
  home_team: string | null;
  away_team: string | null;
  home_logo: string | null;
  away_logo: string | null;
  league_name: string | null;
  match_date: string | null;
  predicted_home: string | null;
  predicted_away: string | null;
  advice: string | null;
  prob_home: string | null;
  prob_draw: string | null;
  prob_away: string | null;
}

function getDateOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  if (diff === 0) return `Today ${dd}/${mm}`;
  if (diff === 1) return `Tomorrow ${dd}/${mm}`;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function groupByLeague(fixtures: FixtureData[]): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();
  for (const f of fixtures) {
    if (!map.has(f.league.id)) map.set(f.league.id, { league: f.league, fixtures: [] });
    map.get(f.league.id)!.fixtures.push(f);
  }
  return Array.from(map.values());
}

export default function DailyTipPage() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [selectedDate, setSelectedDate] = useState(getDateOffset(0));
  const [fixtures, setFixtures] = useState<FixtureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFixture, setExpandedFixture] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [matchSearch, setMatchSearch] = useState("");
  const [fromApiSearch, setFromApiSearch] = useState(false);
  const [apiSearchLoading, setApiSearchLoading] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => ({
    date: getDateOffset(i),
    label: formatDateLabel(getDateOffset(i)),
  }));

  useEffect(() => {
    fetch(API("/admin/daily-tip"), fetchOpts)
      .then((r) => r.json())
      .then((data) => setTip(data && data.home_team ? data : null))
      .catch(console.error);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFromApiSearch(false);
    try {
      const res = await fetch(`/api/fixtures?date=${selectedDate}`);
      const data = await res.json();
      setFixtures(data.response || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const runApiMatchSearch = async () => {
    const q = matchSearch.trim();
    if (q.length < 2) {
      alert("Enter at least 2 characters to search teams.");
      return;
    }
    setApiSearchLoading(true);
    setExpandedFixture(null);
    try {
      const res = await fetch(`${API("/admin/matches/search")}?q=${encodeURIComponent(q)}`, fetchOpts);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Search failed");
        return;
      }
      setFixtures(data.response || []);
      setFromApiSearch(true);
    } catch (e) {
      alert(String(e));
    } finally {
      setApiSearchLoading(false);
    }
  };

  const filteredFixtures = useMemo(() => {
    const q = matchSearch.trim().toLowerCase();
    if (!q) return fixtures;
    return fixtures.filter(
      (f) =>
        f.teams.home.name.toLowerCase().includes(q) ||
        f.teams.away.name.toLowerCase().includes(q) ||
        f.league.name.toLowerCase().includes(q) ||
        f.league.country.toLowerCase().includes(q)
    );
  }, [fixtures, matchSearch]);

  const saveTip = async (fixture: FixtureData, home: string, away: string, advice: string, ph: string, pd: string, pa: string) => {
    setSaving(true);
    try {
      const res = await fetch(API("/admin/daily-tip"), {
        ...fetchOpts,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixture_id: fixture.fixture.id,
          home_team: fixture.teams.home.name,
          away_team: fixture.teams.away.name,
          home_logo: fixture.teams.home.logo,
          away_logo: fixture.teams.away.logo,
          league_name: fixture.league.name,
          match_date: fixture.fixture.date,
          predicted_home: home,
          predicted_away: away,
          advice: advice || null,
          prob_home: ph || null,
          prob_draw: pd || null,
          prob_away: pa || null,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      const saved = await res.json();
      setTip(saved);
      setExpandedFixture(null);
    } catch (e) {
      alert(String(e));
    } finally {
      setSaving(false);
    }
  };

  const clearTip = async () => {
    if (!confirm("Remove the current Daily Tip?")) return;
    setSaving(true);
    try {
      const res = await fetch(API("/admin/daily-tip"), {
        ...fetchOpts,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      if (!res.ok) throw new Error("clear failed");
      setTip(null);
    } catch (e) {
      alert(String(e));
    } finally {
      setSaving(false);
    }
  };

  const groups = groupByLeague(filteredFixtures);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Daily Tip</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pick a match, enter the score manually, and it becomes the Tip of the Day shown on the homepage to active (paid) users.
        </p>
      </div>

      {/* Current tip */}
      {tip && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                Live tip
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {tip.home_team} <span className="text-amber-600 font-black">{tip.predicted_home} - {tip.predicted_away}</span> {tip.away_team}
                </p>
                {tip.advice && <p className="text-xs text-slate-500 truncate">{tip.advice}</p>}
              </div>
            </div>
            <button
              onClick={clearTip}
              disabled={saving}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="w-full sm:max-w-md flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={matchSearch}
              onChange={(e) => setMatchSearch(e.target.value)}
              placeholder="Team, league, country…"
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={runApiMatchSearch}
            disabled={apiSearchLoading || matchSearch.trim().length < 2}
            className="flex-shrink-0 px-3 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {apiSearchLoading ? "…" : "Search"}
          </button>
        </div>
      </div>

      {fromApiSearch && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>Showing API search results (upcoming fixtures for matching teams).</span>
          <button type="button" onClick={() => { setMatchSearch(""); loadData(); }} className="font-semibold text-red-700 hover:underline">
            Back to date view
          </button>
        </div>
      )}

      {/* Date picker */}
      <div className={`flex items-center gap-1.5 overflow-x-auto py-3 mb-6 scrollbar-hide ${fromApiSearch ? "opacity-50 pointer-events-none" : ""}`}>
        {dates.map(({ date, label }) => (
          <button
            key={date}
            onClick={() => { setSelectedDate(date); setExpandedFixture(null); setFromApiSearch(false); }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              date === selectedDate ? "bg-red-600 text-white shadow-lg shadow-red-600/25" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-5 w-40 bg-slate-100 rounded mb-4" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 py-3">
                  <div className="w-12 h-4 bg-slate-100 rounded" />
                  <div className="flex-1 h-4 bg-slate-100 rounded" />
                  <div className="w-20 h-6 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">No matches available. Try another date or search a team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.league.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                {group.league.flag && (
                  <div className="relative w-5 h-3.5 rounded overflow-hidden">
                    <Image src={group.league.flag} alt="" fill className="object-cover" sizes="20px" unoptimized />
                  </div>
                )}
                <div className="relative w-5 h-5">
                  <Image src={group.league.logo} alt="" fill className="object-contain" sizes="20px" unoptimized />
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex-shrink-0">{group.league.country}</span>
                <span className="text-slate-300 flex-shrink-0">·</span>
                <span className="text-sm font-semibold text-slate-900 truncate min-w-0">{group.league.name}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {group.fixtures.map((fixture) => {
                  const fid = fixture.fixture.id;
                  const isExpanded = expandedFixture === fid;
                  const isTip = tip?.featured_fixture_id === fid;
                  const kickoff = new Date(fixture.fixture.date);
                  const timeStr = kickoff.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

                  return (
                    <div key={fid}>
                      <button
                        onClick={() => setExpandedFixture(isExpanded ? null : fid)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="text-sm font-semibold text-red-600 w-12 text-center flex-shrink-0">{timeStr}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="relative w-5 h-5 flex-shrink-0">
                              <Image src={fixture.teams.home.logo} alt="" fill className="object-contain" sizes="20px" unoptimized />
                            </div>
                            <span className="text-sm font-medium text-slate-900 truncate">{fixture.teams.home.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5 flex-shrink-0">
                              <Image src={fixture.teams.away.logo} alt="" fill className="object-contain" sizes="20px" unoptimized />
                            </div>
                            <span className="text-sm font-medium text-slate-900 truncate">{fixture.teams.away.name}</span>
                          </div>
                        </div>
                        {isTip ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 flex-shrink-0">
                            Tip · {tip?.predicted_home} - {tip?.predicted_away}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg flex-shrink-0">Set as tip</span>
                        )}
                        <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <TipForm
                          fixture={fixture}
                          existing={isTip ? tip : null}
                          saving={saving}
                          onSave={(h, a, adv, ph, pd, pa) => saveTip(fixture, h, a, adv, ph, pd, pa)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TipForm({
  fixture,
  existing,
  saving,
  onSave,
}: {
  fixture: FixtureData;
  existing: DailyTip | null;
  saving: boolean;
  onSave: (home: string, away: string, advice: string, probHome: string, probDraw: string, probAway: string) => void;
}) {
  const [home, setHome] = useState(existing?.predicted_home || "");
  const [away, setAway] = useState(existing?.predicted_away || "");
  const [advice, setAdvice] = useState(existing?.advice || "");
  const [probHome, setProbHome] = useState(existing?.prob_home || "");
  const [probDraw, setProbDraw] = useState(existing?.prob_draw || "");
  const [probAway, setProbAway] = useState(existing?.prob_away || "");

  return (
    <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="relative w-6 h-6">
                <Image src={fixture.teams.home.logo} alt="" fill className="object-contain" sizes="24px" unoptimized />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate">{fixture.teams.home.name}</span>
            </div>
            <input
              type="text"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              placeholder="0"
              className="w-full text-center text-3xl font-black py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
            />
          </div>

          <span className="text-2xl font-light text-slate-300 mt-6">-</span>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="relative w-6 h-6">
                <Image src={fixture.teams.away.logo} alt="" fill className="object-contain" sizes="24px" unoptimized />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate">{fixture.teams.away.name}</span>
            </div>
            <input
              type="text"
              value={away}
              onChange={(e) => setAway(e.target.value)}
              placeholder="0"
              className="w-full text-center text-3xl font-black py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Win Probability (%)</label>
          <div className="grid grid-cols-3 sm:gap-3 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1 text-center">Home</label>
              <input type="text" value={probHome} onChange={(e) => setProbHome(e.target.value)} placeholder="e.g. 45%" className="w-full text-center text-sm font-semibold py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 text-center">Draw</label>
              <input type="text" value={probDraw} onChange={(e) => setProbDraw(e.target.value)} placeholder="e.g. 25%" className="w-full text-center text-sm font-semibold py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 text-center">Away</label>
              <input type="text" value={probAway} onChange={(e) => setProbAway(e.target.value)} placeholder="e.g. 30%" className="w-full text-center text-sm font-semibold py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Expert Advice</label>
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="e.g. Double chance: draw or Liverpool"
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition resize-none bg-white"
          />
        </div>

        <button
          onClick={() => onSave(home || "0", away || "0", advice, probHome, probDraw, probAway)}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : existing ? (
            "Update Daily Tip"
          ) : (
            "Set as Daily Tip"
          )}
        </button>
      </div>
    </div>
  );
}
