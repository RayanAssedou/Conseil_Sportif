"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

const API = (path: string) => `/api${path}`;
const fetchOpts = { credentials: "include" as RequestCredentials };

interface Prediction {
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
}

export default function DailyTipPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [initialId, setInitialId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(API("/admin/daily-tip"), fetchOpts).then((r) => r.json()),
      fetch(API("/admin/predictions"), fetchOpts).then((r) => r.json()),
    ])
      .then(([tip, preds]) => {
        const fid = tip?.featured_fixture_id ?? null;
        setSelectedId(fid);
        setInitialId(fid);
        setPredictions(Array.isArray(preds) ? preds : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return predictions;
    return predictions.filter(
      (p) =>
        p.home_team.toLowerCase().includes(q) ||
        p.away_team.toLowerCase().includes(q) ||
        (p.league_name || "").toLowerCase().includes(q)
    );
  }, [predictions, search]);

  const choose = (id: number) => {
    setSelectedId((cur) => (cur === id ? null : id));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(API("/admin/daily-tip"), {
        ...fetchOpts,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured_fixture_id: selectedId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setInitialId(selectedId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert("Could not save the tip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  const dirty = selectedId !== initialId;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Tip</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pick one prediction to feature as the Tip of the Day — shown on the homepage to active (paid) users.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save
        </button>
      </div>

      {saved && (
        <div className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Saved
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:w-80 mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team or league..."
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : predictions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500">
            No predictions yet. Create one in the <span className="font-semibold text-slate-700">Predictions</span> tab first, then feature it here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500">No prediction matches your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const selected = selectedId === p.fixture_id;
            return (
              <button
                key={p.fixture_id}
                onClick={() => choose(p.fixture_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                  selected
                    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400/30"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? "border-amber-500 bg-amber-500" : "border-slate-300"
                  }`}
                >
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  {(p.league_name || p.match_date) && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-slate-400 truncate">{p.league_name}</span>
                      {p.match_date && <span className="text-[11px] text-slate-300">· {fmt(p.match_date)}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {p.home_logo && (
                      <div className="relative w-4 h-4 flex-shrink-0">
                        <Image src={p.home_logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-900 truncate">{p.home_team}</span>
                    <span className="text-slate-300 text-xs">vs</span>
                    {p.away_logo && (
                      <div className="relative w-4 h-4 flex-shrink-0">
                        <Image src={p.away_logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-900 truncate">{p.away_team}</span>
                  </div>
                  {p.advice && <p className="text-xs text-slate-500 mt-1 truncate">{p.advice}</p>}
                </div>

                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg flex-shrink-0">
                  {p.predicted_home} - {p.predicted_away}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
