"use client";

import { useState } from "react";
import Image from "next/image";
import { LeagueGroup } from "@/lib/types";
import { isLive } from "@/lib/utils";
import MatchCard from "./MatchCard";
import { useTranslation } from "@/contexts/LanguageContext";

interface LeagueSectionProps {
  group: LeagueGroup;
}

export default function LeagueSection({ group }: LeagueSectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const hasLiveMatch = group.fixtures.some((f) => isLive(f.fixture.status.short));

  return (
    <div className="animate-slide-up">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-surface rounded-t-xl border border-border hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {group.league.flag && (
            <div className="relative w-5 h-3.5 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={group.league.flag}
                alt={group.league.country}
                fill
                className="object-cover"
                sizes="20px"
                unoptimized
              />
            </div>
          )}
          <div className="relative w-5 h-5 flex-shrink-0">
            <Image
              src={group.league.logo}
              alt={group.league.name}
              fill
              className="object-contain"
              sizes="20px"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
              {group.league.country}
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-sm font-semibold text-text truncate">
              {group.league.name}
            </span>
          </div>
          {hasLiveMatch && (
            <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-bold text-primary">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-live" />
              {t("league.live")}
            </span>
          )}
        </div>
        <span className="text-xs text-text-muted flex-shrink-0">
          {group.fixtures.length} {group.fixtures.length > 1 ? t("common.matches") : t("common.match")}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="bg-white border-x border-b border-border rounded-b-xl overflow-hidden">
          {group.fixtures.map((fixture) => (
            <MatchCard key={fixture.fixture.id} fixture={fixture} />
          ))}
        </div>
      )}
    </div>
  );
}
