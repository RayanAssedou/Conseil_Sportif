"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";

interface Prediction {
  featured_fixture_id: number | null;
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

export default function DailyTipSection() {
  const { session } = useAuth();
  const { t, locale } = useTranslation();
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      setPrediction(null);
      return;
    }

    let cancelled = false;
    fetch("/api/content/daily-tip", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPrediction(data?.active && data?.prediction ? data.prediction : null);
      })
      .catch(() => {
        if (!cancelled) setPrediction(null);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!prediction) return null;

  const kickoff = prediction.match_date ? new Date(prediction.match_date) : null;
  const timeStr = kickoff ? kickoff.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false }) : "";
  const dateStr = kickoff ? kickoff.toLocaleDateString(locale, { day: "2-digit", month: "short" }) : "";
  const hasProb = prediction.prob_home || prediction.prob_draw || prediction.prob_away;
  const fixtureId = prediction.featured_fixture_id;

  const cardBody = (
    <>
      {(prediction.league_name || timeStr) && (
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 truncate">{prediction.league_name}</span>
          {timeStr && (
            <span className="text-[11px] font-medium text-slate-500 flex-shrink-0">
              {dateStr} · {timeStr}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            {prediction.home_logo && (
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image src={prediction.home_logo} alt={prediction.home_team} fill className="object-contain" sizes="20px" unoptimized />
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900 truncate">{prediction.home_team}</span>
          </div>
          <div className="flex items-center gap-2">
            {prediction.away_logo && (
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image src={prediction.away_logo} alt={prediction.away_team} fill className="object-contain" sizes="20px" unoptimized />
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900 truncate">{prediction.away_team}</span>
          </div>
        </div>

        <div className="flex flex-col items-center flex-shrink-0">
          <span className="text-lg font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
            {prediction.predicted_home} - {prediction.predicted_away}
          </span>
        </div>
      </div>

      {prediction.advice && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className="text-sm font-medium text-slate-700 leading-snug">{prediction.advice}</p>
        </div>
      )}

      {hasProb && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "1", value: prediction.prob_home },
            { label: "X", value: prediction.prob_draw },
            { label: "2", value: prediction.prob_away },
          ].map((p) => (
            <div key={p.label} className="rounded-lg bg-slate-50 border border-slate-100 py-1.5 text-center">
              <span className="block text-[10px] font-semibold text-slate-400">{p.label}</span>
              <span className="block text-sm font-bold text-slate-700">{p.value || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const cardClass = "relative block rounded-xl bg-white/95 text-slate-900 p-3.5";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500 to-amber-600 p-4 sm:p-5 text-white shadow-[0_0_24px_rgba(245,158,11,0.25)]">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />

      {/* Header */}
      <div className="relative flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            {t("dailyTip.badge")}
          </span>
          <h2 className="text-base sm:text-lg font-bold leading-tight">{t("dailyTip.title")}</h2>
        </div>
      </div>

      {/* Prediction card */}
      {fixtureId ? (
        <Link href={`/match/${fixtureId}`} className={`${cardClass} hover:bg-white transition-colors`}>
          {cardBody}
        </Link>
      ) : (
        <div className={cardClass}>{cardBody}</div>
      )}
    </section>
  );
}
