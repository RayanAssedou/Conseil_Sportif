"use client";

import Image from "next/image";
import { useTranslation } from "@/contexts/LanguageContext";
import { FixtureStatistic } from "@/lib/types";

interface StatisticsTabProps {
  statistics: FixtureStatistic[];
}

function parseValue(value: string | number | null): number {
  if (value === null) return 0;
  if (typeof value === "number") return value;
  return parseFloat(value.replace("%", "")) || 0;
}

export default function StatisticsTab({ statistics }: StatisticsTabProps) {
  const { t } = useTranslation();
  const statLabels: Record<string, string> = {
    "Shots on Goal": t("stats.shotsOnTarget"),
    "Shots off Goal": t("stats.shotsOffTarget"),
    "Total Shots": t("stats.totalShots"),
    "Blocked Shots": t("stats.blockedShots"),
    "Shots insidebox": t("stats.shotsInsidebox"),
    "Shots outsidebox": t("stats.shotsOutsidebox"),
    "Fouls": t("stats.fouls"),
    "Corner Kicks": t("stats.cornerKicks"),
    "Offsides": t("stats.offsides"),
    "Ball Possession": t("stats.ballPossession"),
    "Yellow Cards": t("stats.yellowCards"),
    "Red Cards": t("stats.redCards"),
    "Goalkeeper Saves": t("stats.saves"),
    "Total passes": t("stats.totalPasses"),
    "Passes accurate": t("stats.passAccuracy"),
    "Passes %": t("stats.passAccuracyPct"),
    "expected_goals": t("stats.expectedGoals"),
  };

  if (statistics.length < 2) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-text-muted">{t("stats.notAvailable")}</p>
      </div>
    );
  }

  const home = statistics[0];
  const away = statistics[1];

  const allStats = home.statistics.map((stat, idx) => ({
    type: stat.type,
    label: statLabels[stat.type] || stat.type,
    homeValue: stat.value,
    awayValue: away.statistics[idx]?.value ?? null,
  }));

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <Image src={home.team.logo} alt={home.team.name} fill className="object-contain" sizes="24px" unoptimized />
          </div>
          <span className="text-sm font-semibold text-text">{home.team.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">{away.team.name}</span>
          <div className="relative w-6 h-6">
            <Image src={away.team.logo} alt={away.team.name} fill className="object-contain" sizes="24px" unoptimized />
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {allStats.map(({ type, label, homeValue, awayValue }) => {
          const hv = parseValue(homeValue);
          const av = parseValue(awayValue);
          const total = hv + av || 1;
          const homePercent = (hv / total) * 100;
          const awayPercent = (av / total) * 100;
          const isPossession = type === "Ball Possession" || type === "Passes %";
          const displayHome = homeValue ?? "0";
          const displayAway = awayValue ?? "0";

          return (
            <div key={type} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-semibold tabular-nums ${hv > av ? "text-text" : "text-text-muted"}`}>
                  {String(displayHome)}
                </span>
                <span className="text-xs text-text-muted font-medium">{label}</span>
                <span className={`text-sm font-semibold tabular-nums ${av > hv ? "text-text" : "text-text-muted"}`}>
                  {String(displayAway)}
                </span>
              </div>

              <div className="flex gap-1 h-1.5">
                <div className="flex-1 flex justify-end">
                  <div
                    className={`h-full rounded-l-full transition-all duration-500 ${
                      hv >= av ? "bg-primary" : "bg-surface-light"
                    }`}
                    style={{ width: `${isPossession ? hv : homePercent}%` }}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`h-full rounded-r-full transition-all duration-500 ${
                      av >= hv ? "bg-score" : "bg-surface-light"
                    }`}
                    style={{ width: `${isPossession ? av : awayPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
