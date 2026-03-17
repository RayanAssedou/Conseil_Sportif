"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fixture } from "@/lib/types";
import { isLive, isFinished, getStatusDisplay, getDateOffset } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const {
    reminders,
    goalAlerts,
    removeReminder,
    toggleGoalAlert,
    toasts,
    dismissToast,
    checkGoalUpdates,
  } = useNotifications();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  const followedIds = new Set([
    ...Array.from(reminders.keys()),
    ...Array.from(goalAlerts.keys()),
  ]);

  const fetchFixtures = useCallback(async () => {
    try {
      const today = getDateOffset(0);
      const res = await fetch(`/api/fixtures?date=${today}`);
      const data = await res.json();
      if (data.response) {
        setFixtures(data.response);
        checkGoalUpdates(data.response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [checkGoalUpdates]);

  useEffect(() => {
    fetchFixtures();
    const interval = setInterval(fetchFixtures, 30000);
    return () => clearInterval(interval);
  }, [fetchFixtures]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [authLoading, user, router]);

  const followedFixtures = fixtures.filter((f) => followedIds.has(f.fixture.id));

  const liveFollowed = followedFixtures.filter((f) => isLive(f.fixture.status.short));
  const upcomingFollowed = followedFixtures.filter(
    (f) => !isLive(f.fixture.status.short) && !isFinished(f.fixture.status.short)
  );
  const finishedFollowed = followedFixtures.filter((f) => isFinished(f.fixture.status.short));

  const pendingReminders = Array.from(reminders.values()).filter(
    (r) => !fixtures.some((f) => f.fixture.id === r.fixtureId)
  );

  const pendingGoalAlerts = Array.from(goalAlerts.values()).filter(
    (a) => !fixtures.some((f) => f.fixture.id === a.fixtureId)
  );

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface-light rounded" />
          <div className="h-4 w-64 bg-surface-light rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 mx-auto mb-3">
          <svg className="w-10 h-10 animate-spin text-text-muted" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-sm text-text-muted">{t("notifications.redirecting")}</p>
      </div>
    );
  }

  const totalFollowed = followedIds.size;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">{t("notifications.title")}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {totalFollowed > 0
                ? (totalFollowed > 1 ? t("notifications.followingCountPlural", { count: totalFollowed }) : t("notifications.followingCount", { count: totalFollowed }))
                : t("notifications.noFollowed")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent alerts */}
      {toasts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">{t("notifications.recentAlerts")}</h2>
          <div className="space-y-2">
            {toasts.map((toast) => (
              <Link
                key={toast.id}
                href={`/match/${toast.fixtureId}`}
                className={`flex items-center gap-3 p-3 rounded-xl border hover:shadow-md transition-shadow ${
                  toast.type === "goal"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  toast.type === "goal" ? "bg-emerald-100" : "bg-amber-100"
                }`}>
                  {toast.type === "goal" ? (
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.93 0 3.68.69 5.05 1.83L14.5 8.5l-2.5-1-2.5 1-2.55-2.67A7.956 7.956 0 0112 4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${toast.type === "goal" ? "text-emerald-800" : "text-amber-800"}`}>
                    {toast.title}
                  </p>
                  <p className="text-xs text-slate-600">{toast.body}</p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissToast(toast.id); }}
                  className="p-1 rounded hover:bg-black/5 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {totalFollowed === 0 && toasts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">{t("notifications.noMatchesFollowed")}</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
            {t("notifications.emptyDesc")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/scores" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
              {t("notifications.liveScores")}
            </Link>
            <Link href="/pronostics" className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-surface-hover transition-colors text-text">
              {t("notifications.predictions")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live matches being followed */}
          {liveFollowed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {t("notifications.liveNow")} ({liveFollowed.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveFollowed.map((f) => (
                  <FollowedMatchCard
                    key={f.fixture.id}
                    fixture={f}
                    type="live"
                    onUnfollow={() => toggleGoalAlert(f)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming matches with reminders */}
          {upcomingFollowed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                {t("notifications.upcoming")} ({upcomingFollowed.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingFollowed.map((f) => (
                  <FollowedMatchCard
                    key={f.fixture.id}
                    fixture={f}
                    type="upcoming"
                    onUnfollow={() => removeReminder(f.fixture.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Pending reminders (matches not loaded today) */}
          {pendingReminders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                {t("notifications.scheduledReminders")} ({pendingReminders.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingReminders.map((r) => (
                  <div key={r.fixtureId} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <Link href={`/pronostics/${r.fixtureId}`} className="block p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image src={r.homeLogo} alt="" fill className="object-contain" sizes="32px" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{r.homeTeam} vs {r.awayTeam}</p>
                          <p className="text-xs text-text-muted">
                            {new Date(r.kickoffISO).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeReminder(r.fixtureId); }}
                          className="p-1.5 rounded-md text-amber-500 bg-amber-50 hover:bg-amber-100 transition-colors flex-shrink-0"
                          title={t("notifications.removeReminder")}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                          </svg>
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending goal alerts (matches not in today's fixtures) */}
          {pendingGoalAlerts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                {t("notifications.scheduledReminders")} ({pendingGoalAlerts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingGoalAlerts.map((a) => (
                  <div key={a.fixtureId} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="block p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image src={a.homeLogo} alt="" fill className="object-contain" sizes="32px" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{a.homeTeam} vs {a.awayTeam}</p>
                          <p className="text-xs text-text-muted">{t("notifications.finished")}</p>
                        </div>
                        <button
                          onClick={() => toggleGoalAlert({ fixture: { id: a.fixtureId } } as Fixture)}
                          className="p-1.5 rounded-md text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex-shrink-0"
                          title={t("notifications.unfollow")}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Finished */}
          {finishedFollowed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                {t("notifications.finished")} ({finishedFollowed.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finishedFollowed.map((f) => (
                  <FollowedMatchCard
                    key={f.fixture.id}
                    fixture={f}
                    type="finished"
                    onUnfollow={() => {
                      removeReminder(f.fixture.id);
                      if (goalAlerts.has(f.fixture.id)) toggleGoalAlert(f);
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {loading && totalFollowed > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t("notifications.updatingScores")}
        </div>
      )}
    </div>
  );
}

function FollowedMatchCard({
  fixture,
  type,
  onUnfollow,
}: {
  fixture: Fixture;
  type: "live" | "upcoming" | "finished";
  onUnfollow: () => void;
}) {
  const { t, locale } = useTranslation();
  const live = type === "live";
  const finished = type === "finished";
  const statusText = getStatusDisplay(fixture, locale);
  const hasScore = fixture.goals.home !== null && fixture.goals.away !== null;

  const detailHref = live || finished ? `/match/${fixture.fixture.id}` : `/pronostics/${fixture.fixture.id}`;

  return (
    <div className={`relative bg-card rounded-xl border overflow-hidden transition-shadow hover:shadow-md cursor-pointer ${
      live ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
    }`}>
      {live && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}

      <Link href={detailHref} className="block p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {fixture.league?.logo && (
              <div className="relative w-4 h-4 flex-shrink-0">
                <Image src={fixture.league.logo} alt="" fill className="object-contain" sizes="16px" unoptimized />
              </div>
            )}
            <span className="text-[11px] text-text-muted truncate">{fixture.league?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {live ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded text-xs font-bold text-primary">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                {statusText}
              </span>
            ) : finished ? (
              <span className="text-xs font-medium text-text-muted">{statusText}</span>
            ) : (
              <span className="text-xs font-semibold text-primary">{statusText}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image src={fixture.teams.home.logo} alt="" fill className="object-contain" sizes="28px" unoptimized />
            </div>
            <span className={`text-sm font-medium truncate ${
              finished && fixture.teams.home.winner ? "font-bold" : ""
            }`}>{fixture.teams.home.name}</span>
          </div>
          <span className={`text-lg font-black min-w-[24px] text-center ${live ? "text-primary" : "text-text"}`}>
            {hasScore ? fixture.goals.home : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image src={fixture.teams.away.logo} alt="" fill className="object-contain" sizes="28px" unoptimized />
            </div>
            <span className={`text-sm font-medium truncate ${
              finished && fixture.teams.away.winner ? "font-bold" : ""
            }`}>{fixture.teams.away.name}</span>
          </div>
          <span className={`text-lg font-black min-w-[24px] text-center ${live ? "text-primary" : "text-text"}`}>
            {hasScore ? fixture.goals.away : "-"}
          </span>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <Link
            href={detailHref}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("notifications.viewDetails")}
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); onUnfollow(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {t("notifications.unfollow")}
          </button>
        </div>
      </div>
    </div>
  );
}
