"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fixture } from "@/lib/types";
import { isLive, isFinished, getStatusDisplay } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";

interface MatchCardProps {
  fixture: Fixture;
}

export default function MatchCard({ fixture }: MatchCardProps) {
  const router = useRouter();
  const { addReminder, removeReminder, hasReminder, toggleGoalAlert, hasGoalAlert } = useNotifications();
  const { t, locale } = useTranslation();
  const live = isLive(fixture.fixture.status.short);
  const finished = isFinished(fixture.fixture.status.short);
  const upcoming = !live && !finished;
  const statusText = getStatusDisplay(fixture, locale);
  const showBell = !finished;
  const isFollowed = hasReminder(fixture.fixture.id) || hasGoalAlert(fixture.fixture.id);

  const homeGoals = fixture.goals.home;
  const awayGoals = fixture.goals.away;
  const hasScore = homeGoals !== null && awayGoals !== null;

  return (
    <div
      onClick={() => router.push(`/match/${fixture.fixture.id}`)}
      className={`
        group relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
        hover:bg-surface-hover border-b border-border/50 last:border-b-0
        ${live ? "bg-primary/[0.03]" : ""}
      `}
    >
      {live && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
      )}

      <div className="flex-shrink-0 w-16 text-center">
        {live ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-bold text-primary animate-pulse-live">{statusText}</span>
          </div>
        ) : finished ? (
          <span className="text-xs font-medium text-text-muted">{statusText}</span>
        ) : (
          <span className="text-sm font-semibold text-primary">{statusText}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={fixture.teams.home.logo}
                alt={fixture.teams.home.name}
                fill
                className="object-contain"
                sizes="24px"
                unoptimized
              />
            </div>
            <span className={`text-sm truncate ${
              finished && fixture.teams.home.winner ? "font-bold text-text" :
              finished && fixture.teams.home.winner === false ? "text-text-muted" :
              "text-text"
            }`}>
              {fixture.teams.home.name}
            </span>
          </div>
          <span className={`text-sm font-bold min-w-[20px] text-right ${
            live ? "text-score" : finished ? "text-text-secondary" : "text-text-muted"
          }`}>
            {hasScore ? homeGoals : "-"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={fixture.teams.away.logo}
                alt={fixture.teams.away.name}
                fill
                className="object-contain"
                sizes="24px"
                unoptimized
              />
            </div>
            <span className={`text-sm truncate ${
              finished && fixture.teams.away.winner ? "font-bold text-text" :
              finished && fixture.teams.away.winner === false ? "text-text-muted" :
              "text-text"
            }`}>
              {fixture.teams.away.name}
            </span>
          </div>
          <span className={`text-sm font-bold min-w-[20px] text-right ${
            live ? "text-score" : finished ? "text-text-secondary" : "text-text-muted"
          }`}>
            {hasScore ? awayGoals : "-"}
          </span>
        </div>
      </div>

      {showBell && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (upcoming) {
              isFollowed ? removeReminder(fixture.fixture.id) : addReminder(fixture);
            } else {
              toggleGoalAlert(fixture);
            }
          }}
          className={`flex-shrink-0 p-1.5 rounded-md transition-all ${
            isFollowed
              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
              : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
          }`}
          title={isFollowed ? t("match.followingUnfollow") : (upcoming ? t("match.remindKickoff") : t("match.alertGoals"))}
        >
          <svg className="w-4 h-4" fill={isFollowed ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
      )}

      <svg className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
