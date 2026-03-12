"use client";

import { useState, useEffect, useCallback } from "react";
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
  league: { id: number; name: string; country: string; logo: string; flag: string | null };
  fixtures: FixtureData[];
}

interface AdminPrediction {
  fixture_id: number;
  predicted_home: string;
  predicted_away: string;
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
  if (diff === -1) return `Yesterday ${dd}/${mm}`;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function groupByLeague(fixtures: FixtureData[]): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();
  for (const f of fixtures) {
    if (!map.has(f.league.id)) {
      map.set(f.league.id, { league: f.league, fixtures: [] });
    }
    map.get(f.league.id)!.fixtures.push(f);
  }
  return Array.from(map.values());
}

export default function AdminPredictionsPage() {
  const [selectedDate, setSelectedDate] = useState(getDateOffset(0));
  const [fixtures, setFixtures] = useState<FixtureData[]>([]);
  const [predictions, setPredictions] = useState<Map<number, AdminPrediction>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedFixture, setExpandedFixture] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const dates = Array.from({ length: 7 }, (_, i) => ({
    date: getDateOffset(i),
    label: formatDateLabel(getDateOffset(i)),
  }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fixtures?date=${selectedDate}`);
      const data = await res.json();
      const fixtureList: FixtureData[] = data.response || [];
      setFixtures(fixtureList);

      if (fixtureList.length > 0) {
        const ids = fixtureList.map((f) => f.fixture.id).join(",");
        const predRes = await fetch(API(`/admin/predictions?fixtureIds=${ids}`), fetchOpts);
        const predData = await predRes.json();
        const predMap = new Map<number, AdminPrediction>();
        if (Array.isArray(predData)) {
          predData.forEach((p: AdminPrediction) => predMap.set(p.fixture_id, p));
        }
        setPredictions(predMap);
      } else {
        setPredictions(new Map());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const savePrediction = async (fixture: FixtureData, homeScore: string, awayScore: string, advice: string, probHome: string, probDraw: string, probAway: string) => {
    setSaving(fixture.fixture.id);
    try {
      const res = await fetch(API("/admin/predictions"), {
        method: "POST",
        ...fetchOpts,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixture_id: fixture.fixture.id,
          home_team: fixture.teams.home.name,
          away_team: fixture.teams.away.name,
          home_logo: fixture.teams.home.logo,
          away_logo: fixture.teams.away.logo,
          league_name: fixture.league.name,
          match_date: fixture.fixture.date,
          predicted_home: homeScore,
          predicted_away: awayScore,
          advice: advice || null,
          prob_home: probHome || null,
          prob_draw: probDraw || null,
          prob_away: probAway || null,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setPredictions((prev) => {
          const next = new Map(prev);
          next.set(fixture.fixture.id, saved);
          return next;
        });
        setExpandedFixture(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to save");
      }
    } catch (e) {
      alert(String(e));
    } finally {
      setSaving(null);
    }
  };

  const deletePrediction = async (fixtureId: number) => {
    if (!confirm("Remove this prediction?")) return;
    setSaving(fixtureId);
    try {
      const res = await fetch(API(`/admin/predictions/${fixtureId}`), { method: "DELETE", ...fetchOpts });
      if (res.ok) {
        setPredictions((prev) => {
          const next = new Map(prev);
          next.delete(fixtureId);
          return next;
        });
        setExpandedFixture(null);
      }
    } catch (e) {
      alert(String(e));
    } finally {
      setSaving(null);
    }
  };

  const groups = groupByLeague(fixtures);
  const totalPredictions = predictions.size;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Predictions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add your expert predictions for upcoming matches
            {totalPredictions > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {totalPredictions} prediction{totalPredictions !== 1 ? "s" : ""} set
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 mb-6 scrollbar-hide">
        {dates.map(({ date, label }) => (
          <button
            key={date}
            onClick={() => { setSelectedDate(date); setExpandedFixture(null); }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              date === selectedDate
                ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
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
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No matches found</h3>
          <p className="text-sm text-slate-500">No matches available for this date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.league.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* League header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                {group.league.flag && (
                  <div className="relative w-5 h-3.5 rounded overflow-hidden">
                    <Image src={group.league.flag} alt="" fill className="object-cover" sizes="20px" unoptimized />
                  </div>
                )}
                <div className="relative w-5 h-5">
                  <Image src={group.league.logo} alt="" fill className="object-contain" sizes="20px" unoptimized />
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{group.league.country}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm font-semibold text-slate-900">{group.league.name}</span>
              </div>

              {/* Matches */}
              <div className="divide-y divide-slate-100">
                {group.fixtures.map((fixture) => {
                  const fid = fixture.fixture.id;
                  const pred = predictions.get(fid);
                  const isExpanded = expandedFixture === fid;
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

                        {pred ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                              {pred.predicted_home} - {pred.predicted_away}
                            </span>
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg flex-shrink-0">
                            No prediction
                          </span>
                        )}

                        <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <PredictionForm
                          fixture={fixture}
                          existing={pred || null}
                          saving={saving === fid}
                          onSave={(h, a, adv, ph, pd, pa) => savePrediction(fixture, h, a, adv, ph, pd, pa)}
                          onDelete={pred ? () => deletePrediction(fid) : undefined}
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

function PredictionForm({
  fixture,
  existing,
  saving,
  onSave,
  onDelete,
}: {
  fixture: FixtureData;
  existing: AdminPrediction | null;
  saving: boolean;
  onSave: (home: string, away: string, advice: string, probHome: string, probDraw: string, probAway: string) => void;
  onDelete?: () => void;
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
        {/* Score input */}
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

        {/* Win probability */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Win Probability (%)</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1 text-center">Home</label>
              <input
                type="text"
                value={probHome}
                onChange={(e) => setProbHome(e.target.value)}
                placeholder="e.g. 45%"
                className="w-full text-center text-sm font-semibold py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 text-center">Draw</label>
              <input
                type="text"
                value={probDraw}
                onChange={(e) => setProbDraw(e.target.value)}
                placeholder="e.g. 25%"
                className="w-full text-center text-sm font-semibold py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 text-center">Away</label>
              <input
                type="text"
                value={probAway}
                onChange={(e) => setProbAway(e.target.value)}
                placeholder="e.g. 30%"
                className="w-full text-center text-sm font-semibold py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
              />
            </div>
          </div>
        </div>

        {/* Advice */}
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(home || "0", away || "0", advice, probHome, probDraw, probAway)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
              "Update Prediction"
            ) : (
              "Save Prediction"
            )}
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
