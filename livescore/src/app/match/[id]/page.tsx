"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import { Fixture, FixtureEvent } from "@/lib/types";
import { isLive, getStatusDisplay } from "@/lib/utils";
import SummaryTab from "@/components/match/SummaryTab";

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useTranslation();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [events, setEvents] = useState<FixtureEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [fixtureRes, eventsRes] = await Promise.all([
          fetch(`/api/fixtures/${id}`),
          fetch(`/api/fixtures/${id}/events`),
        ]);

        const [fixtureData, eventsData] = await Promise.all([
          fixtureRes.json(),
          eventsRes.json(),
        ]);

        if (fixtureData.response?.[0]) setFixture(fixtureData.response[0]);
        if (eventsData.response) setEvents(eventsData.response);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-surface-light rounded" />
          <div className="bg-surface rounded-2xl border border-border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-surface-light rounded-full" />
                <div className="h-5 w-32 bg-surface-light rounded" />
              </div>
              <div className="h-10 w-20 bg-surface-light rounded" />
              <div className="flex items-center gap-3">
                <div className="h-5 w-32 bg-surface-light rounded" />
                <div className="w-16 h-16 bg-surface-light rounded-full" />
              </div>
            </div>
          </div>
          <div className="h-12 bg-surface-light rounded-xl" />
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 bg-surface-light rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-text mb-2">{t("matchDetail.notFound")}</h2>
        <p className="text-text-muted mb-6">{t("matchDetail.notFoundDesc")}</p>
        <Link href="/scores" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
          {t("matchDetail.backToScores")}
        </Link>
      </div>
    );
  }

  const live = isLive(fixture.fixture.status.short);
  const statusText = getStatusDisplay(fixture, locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/scores"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t("matchDetail.backToScores")}
      </Link>

      <div className="flex items-center gap-2 flex-wrap">
        {fixture.league.flag && (
          <div className="relative w-5 h-3.5 rounded overflow-hidden flex-shrink-0">
            <Image src={fixture.league.flag} alt={fixture.league.country} fill className="object-cover" sizes="20px" unoptimized />
          </div>
        )}
        <div className="relative w-5 h-5 flex-shrink-0">
          <Image src={fixture.league.logo} alt={fixture.league.name} fill className="object-contain" sizes="20px" unoptimized />
        </div>
        <span className="text-xs text-text-muted uppercase tracking-wider">{fixture.league.country}</span>
        <span className="text-text-muted hidden sm:inline">·</span>
        <span className="text-sm font-medium text-text-secondary">{fixture.league.name}</span>
        <span className="text-text-muted hidden sm:inline">·</span>
        <span className="text-xs text-text-muted">{fixture.league.round}</span>
      </div>

      <div className={`relative bg-card rounded-2xl border overflow-hidden shadow-sm ${
        live ? "border-primary/30" : "border-border"
      }`}>
        {live && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} fill className="object-contain" sizes="80px" unoptimized />
              </div>
              <span className="text-sm md:text-base font-semibold text-text text-center leading-tight">
                {fixture.teams.home.name}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 px-4 md:px-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-5xl font-black text-score tabular-nums">
                  {fixture.goals.home ?? "-"}
                </span>
                <span className="text-2xl md:text-4xl font-light text-text-muted">-</span>
                <span className="text-3xl md:text-5xl font-black text-score tabular-nums">
                  {fixture.goals.away ?? "-"}
                </span>
              </div>

              {live ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-live" />
                  <span className="text-xs font-bold text-primary">{statusText}</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-text-muted px-3 py-1 bg-surface rounded-full">
                  {statusText}
                </span>
              )}

              {fixture.score.halftime.home !== null && (
                <span className="text-xs text-text-muted">
                  {t("matchDetail.halfTime")} {fixture.score.halftime.home} - {fixture.score.halftime.away}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} fill className="object-contain" sizes="80px" unoptimized />
              </div>
              <span className="text-sm md:text-base font-semibold text-text text-center leading-tight">
                {fixture.teams.away.name}
              </span>
            </div>
          </div>

          {fixture.fixture.venue.name && (
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-4 text-xs text-text-muted">
              <span>{fixture.fixture.venue.name}, {fixture.fixture.venue.city}</span>
              {fixture.fixture.referee && (
                <>
                  <span>·</span>
                  <span>{t("matchDetail.referee")} {fixture.fixture.referee}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="animate-slide-up">
        <SummaryTab events={events} fixture={fixture} />
      </div>
    </div>
  );
}
