"use client";

import { MatchStatus } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";

interface StatusFilterProps {
  status: MatchStatus;
  onChange: (status: MatchStatus) => void;
  liveCounts: { live: number; finished: number; upcoming: number; all: number };
}

const filterKeys: { key: MatchStatus; labelKey: string }[] = [
  { key: "all", labelKey: "filter.all" },
  { key: "live", labelKey: "filter.live" },
  { key: "finished", labelKey: "filter.finished" },
  { key: "upcoming", labelKey: "filter.upcoming" },
];

export default function StatusFilter({ status, onChange, liveCounts }: StatusFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border">
      {filterKeys.map(({ key, labelKey }) => {
        const count = liveCounts[key];
        const isActive = status === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? key === "live"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-card text-text border border-border shadow-sm"
                : "text-text-muted hover:text-text-secondary"
              }
            `}
          >
            {key === "live" && (
              <span className="relative flex h-1.5 w-1.5">
                {count > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
            )}
            {t(labelKey)}
            <span className={`text-xs ${isActive ? "opacity-70" : "opacity-50"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
