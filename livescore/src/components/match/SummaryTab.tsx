"use client";

import Image from "next/image";
import { useTranslation } from "@/contexts/LanguageContext";
import { Fixture, FixtureEvent } from "@/lib/types";

interface SummaryTabProps {
  events: FixtureEvent[];
  fixture: Fixture;
}

function getEventIcon(type: string, detail: string) {
  if (type === "Goal") {
    if (detail === "Own Goal") return "🔴";
    if (detail === "Penalty") return "⚽(P)";
    if (detail === "Missed Penalty") return "❌(P)";
    return "⚽";
  }
  if (type === "Card") {
    if (detail === "Yellow Card") return "🟨";
    if (detail.includes("Red")) return "🟥";
    return "🟨";
  }
  if (type === "subst") return "🔄";
  if (type === "Var") return "📺";
  return "•";
}

export default function SummaryTab({ events, fixture }: SummaryTabProps) {
  const { t, locale } = useTranslation();
  const statusShort = fixture.fixture.status.short;
  const isMatchLive = ["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"].includes(statusShort);
  const isNotStarted = ["TBD", "NS"].includes(statusShort);

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
        {isMatchLive ? (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
              </span>
            </div>
            <p className="text-text font-medium mb-1">{t("summary.matchInProgress")}</p>
            <p className="text-sm text-text-muted">{t("summary.eventsWillAppear")}</p>
          </>
        ) : isNotStarted ? (
          <>
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text font-medium mb-1">{t("summary.matchNotStarted")}</p>
            <p className="text-sm text-text-muted">
              {new Date(fixture.fixture.date).toLocaleString(locale, { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-muted">{t("summary.noEvents")}</p>
          </>
        )}
      </div>
    );
  }

  const homeId = fixture.teams.home.id;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text">Match Events</h3>
      </div>

      <div className="divide-y divide-border/50">
        {events.map((event, idx) => {
          const isHome = event.team.id === homeId;
          const icon = getEventIcon(event.type, event.detail);
          const time = event.time.extra
            ? `${event.time.elapsed}+${event.time.extra}'`
            : `${event.time.elapsed}'`;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 py-3 ${
                event.type === "Goal" && event.detail !== "Missed Penalty"
                  ? "bg-primary/[0.03]"
                  : ""
              }`}
            >
              {isHome ? (
                <>
                  <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                    <div className="text-right min-w-0">
                      <span className="text-sm font-medium text-text truncate block">
                        {event.player.name}
                      </span>
                      {event.assist.name && event.type === "Goal" && (
                        <span className="text-xs text-text-muted">{t("summary.assist")} {event.assist.name}</span>
                      )}
                      {event.type === "subst" && event.assist.name && (
                        <span className="text-xs text-text-muted">← {event.assist.name}</span>
                      )}
                    </div>
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image src={event.team.logo} alt={event.team.name} fill className="object-contain" sizes="20px" unoptimized />
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className="text-xs">{icon}</span>
                    <span className="text-xs font-bold text-text-secondary ml-1">{time}</span>
                  </div>
                  <div className="flex-1" />
                </>
              ) : (
                <>
                  <div className="flex-1" />
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className="text-xs font-bold text-text-secondary mr-1">{time}</span>
                    <span className="text-xs">{icon}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image src={event.team.logo} alt={event.team.name} fill className="object-contain" sizes="20px" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-text truncate block">
                        {event.player.name}
                      </span>
                      {event.assist.name && event.type === "Goal" && (
                        <span className="text-xs text-text-muted">{t("summary.assist")} {event.assist.name}</span>
                      )}
                      {event.type === "subst" && event.assist.name && (
                        <span className="text-xs text-text-muted">← {event.assist.name}</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
