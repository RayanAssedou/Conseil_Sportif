"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { Fixture } from "@/lib/types";
import { translate } from "@/lib/i18n";
import { isLive, isFinished, getDateOffset } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { registerServiceWorker, subscribeToPush, sendSubscriptionToServer, syncFollowToServer } from "@/lib/push";

interface ReminderData {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  kickoffISO: string;
}

interface GoalAlertData {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  lastHomeGoals: number | null;
  lastAwayGoals: number | null;
  createdAt?: number;
}

export interface NotifToast {
  id: string;
  type: "kickoff" | "goal" | "penalty";
  title: string;
  body: string;
  fixtureId: number;
  timestamp: number;
}

interface NotificationContextType {
  reminders: Map<number, ReminderData>;
  goalAlerts: Map<number, GoalAlertData>;
  toasts: NotifToast[];
  addReminder: (fixture: Fixture) => void;
  removeReminder: (fixtureId: number) => void;
  hasReminder: (fixtureId: number) => boolean;
  toggleGoalAlert: (fixture: Fixture) => void;
  hasGoalAlert: (fixtureId: number) => boolean;
  checkGoalUpdates: (fixtures: Fixture[]) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  reminders: new Map(),
  goalAlerts: new Map(),
  toasts: [],
  addReminder: () => {},
  removeReminder: () => {},
  hasReminder: () => false,
  toggleGoalAlert: () => {},
  hasGoalAlert: () => false,
  checkGoalUpdates: () => {},
  dismissToast: () => {},
});

const LS_REMINDERS = "ls_match_reminders";
const LS_GOAL_ALERTS = "ls_goal_alerts";

function loadMap<T>(key: string): Map<number, T> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    const entries: [number, T][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

function saveMap<T>(key: string, map: Map<number, T>) {
  localStorage.setItem(key, JSON.stringify(Array.from(map.entries())));
}

async function requestPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { locale } = useTranslation();
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const [reminders, setReminders] = useState<Map<number, ReminderData>>(new Map());
  const [goalAlerts, setGoalAlerts] = useState<Map<number, GoalAlertData>>(new Map());
  const [toasts, setToasts] = useState<NotifToast[]>([]);
  const [mounted, setMounted] = useState(false);

  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;
  const goalAlertsRef = useRef(goalAlerts);
  goalAlertsRef.current = goalAlerts;
  const pushEndpointRef = useRef<string | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const eventsCountRef = useRef<Map<number, number>>(new Map());

  const ensurePushSubscription = useCallback(async (): Promise<string | null> => {
    if (pushEndpointRef.current) return pushEndpointRef.current;

    try {
      let reg = swRegistrationRef.current;
      if (!reg) {
        reg = await registerServiceWorker();
        if (!reg) { console.warn("[Push] Service Worker registration failed"); return null; }
        swRegistrationRef.current = reg;
      }

      const permission = await requestPermission();
      if (!permission) { console.warn("[Push] Notification permission denied"); return null; }

      const sub = await subscribeToPush(reg);
      if (!sub) { console.warn("[Push] Push subscription failed"); return null; }

      pushEndpointRef.current = sub.endpoint;
      const sent = await sendSubscriptionToServer(sub, undefined, localeRef.current);
      if (!sent) console.warn("[Push] Failed to sync subscription to server");

      return sub.endpoint;
    } catch (err) {
      console.error("[Push] Setup error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const remindersLoaded = loadMap<ReminderData>(LS_REMINDERS);
    const now = Date.now();
    const STALE_MS = 4 * 60 * 60 * 1000;
    let remindersChanged = false;
    for (const [id, r] of remindersLoaded) {
      if (r.kickoffISO && now - new Date(r.kickoffISO).getTime() > STALE_MS) {
        remindersLoaded.delete(id);
        remindersChanged = true;
      }
    }
    if (remindersChanged) saveMap(LS_REMINDERS, remindersLoaded);
    setReminders(remindersLoaded);

    const alerts = loadMap<GoalAlertData>(LS_GOAL_ALERTS);
    let cleaned = false;
    for (const [id, alert] of alerts) {
      if (!alert.createdAt || now - alert.createdAt > STALE_MS) {
        alerts.delete(id);
        cleaned = true;
      }
    }
    if (cleaned) saveMap(LS_GOAL_ALERTS, alerts);
    setGoalAlerts(alerts);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    registerServiceWorker().then((reg) => {
      if (reg) swRegistrationRef.current = reg;
    });
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      ensurePushSubscription();
    }
  }, [mounted, ensurePushSubscription]);

  useEffect(() => {
    if (mounted) saveMap(LS_REMINDERS, reminders);
  }, [reminders, mounted]);

  useEffect(() => {
    if (mounted) saveMap(LS_GOAL_ALERTS, goalAlerts);
  }, [goalAlerts, mounted]);

  const addToast = useCallback((toast: Omit<NotifToast, "id" | "timestamp">) => {
    const newToast: NotifToast = { ...toast, id: crypto.randomUUID(), timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addReminder = useCallback(async (fixture: Fixture) => {
    if (isFinished(fixture.fixture.status.short)) return;
    const endpoint = await ensurePushSubscription();
    setReminders((prev) => {
      const next = new Map(prev);
      next.set(fixture.fixture.id, {
        fixtureId: fixture.fixture.id,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeLogo: fixture.teams.home.logo,
        awayLogo: fixture.teams.away.logo,
        kickoffISO: fixture.fixture.date,
      });
      return next;
    });
    if (endpoint) {
      syncFollowToServer(endpoint, fixture.fixture.id, "reminder", "add");
    }
  }, [ensurePushSubscription]);

  const removeReminder = useCallback((fixtureId: number) => {
    setReminders((prev) => {
      const next = new Map(prev);
      next.delete(fixtureId);
      return next;
    });
    if (pushEndpointRef.current) {
      syncFollowToServer(pushEndpointRef.current, fixtureId, "reminder", "remove");
    }
  }, []);

  const hasReminder = useCallback((fixtureId: number) => reminders.has(fixtureId), [reminders]);

  const toggleGoalAlert = useCallback(async (fixture: Fixture) => {
    if (isFinished(fixture.fixture.status.short) && !goalAlertsRef.current.has(fixture.fixture.id)) return;
    const endpoint = await ensurePushSubscription();
    const wasFollowing = goalAlertsRef.current.has(fixture.fixture.id);
    setGoalAlerts((prev) => {
      const next = new Map(prev);
      if (next.has(fixture.fixture.id)) {
        next.delete(fixture.fixture.id);
      } else {
        next.set(fixture.fixture.id, {
          fixtureId: fixture.fixture.id,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeLogo: fixture.teams.home.logo,
          awayLogo: fixture.teams.away.logo,
          lastHomeGoals: fixture.goals.home,
          lastAwayGoals: fixture.goals.away,
          createdAt: Date.now(),
        });
      }
      return next;
    });
    if (endpoint) {
      syncFollowToServer(
        endpoint,
        fixture.fixture.id,
        "goal_alert",
        wasFollowing ? "remove" : "add"
      );
    }
  }, [ensurePushSubscription]);

  const hasGoalAlert = useCallback((fixtureId: number) => goalAlerts.has(fixtureId), [goalAlerts]);

  const checkGoalUpdates = useCallback((fixtures: Fixture[]) => {
    setGoalAlerts((prev) => {
      const next = new Map(prev);
      let changed = false;

      for (const f of fixtures) {
        const alert = next.get(f.fixture.id);
        if (!alert) continue;

        if (isFinished(f.fixture.status.short)) {
          next.delete(f.fixture.id);
          eventsCountRef.current.delete(f.fixture.id);
          changed = true;
          if (pushEndpointRef.current) {
            syncFollowToServer(pushEndpointRef.current, f.fixture.id, "goal_alert", "remove");
          }
          continue;
        }

        const newHome = f.goals.home;
        const newAway = f.goals.away;
        if (
          newHome !== null &&
          newAway !== null &&
          (newHome !== alert.lastHomeGoals || newAway !== alert.lastAwayGoals)
        ) {
          const isHomeGoal = newHome !== alert.lastHomeGoals;
          const scorer = isHomeGoal ? alert.homeTeam : alert.awayTeam;
          const title = translate("en", "notif.goal", { scorer });
          const body = `${alert.homeTeam} ${newHome} - ${newAway} ${alert.awayTeam}`;

          addToast({ type: "goal", title, body, fixtureId: f.fixture.id });

          alert.lastHomeGoals = newHome;
          alert.lastAwayGoals = newAway;
          next.set(f.fixture.id, { ...alert });
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [addToast]);

  const checkReminders = useCallback((fixtures: Fixture[]) => {
    const promoted: Fixture[] = [];

    setReminders((prev) => {
      const next = new Map(prev);
      let changed = false;

      for (const f of fixtures) {
        const reminder = next.get(f.fixture.id);
        if (!reminder) continue;

        if (isLive(f.fixture.status.short)) {
          const title = translate(localeRef.current, "notif.matchStarted");
          const body = translate(localeRef.current, "notif.matchLive", { homeTeam: reminder.homeTeam, awayTeam: reminder.awayTeam });
          addToast({ type: "kickoff", title, body, fixtureId: f.fixture.id });
          promoted.push(f);
          next.delete(f.fixture.id);
          changed = true;
        } else if (isFinished(f.fixture.status.short)) {
          next.delete(f.fixture.id);
          eventsCountRef.current.delete(f.fixture.id);
          changed = true;
          if (pushEndpointRef.current) {
            syncFollowToServer(pushEndpointRef.current, f.fixture.id, "reminder", "remove");
          }
        }
      }

      return changed ? next : prev;
    });

    if (promoted.length > 0) {
      setGoalAlerts((prev) => {
        const next = new Map(prev);
        for (const f of promoted) {
          if (!next.has(f.fixture.id)) {
            next.set(f.fixture.id, {
              fixtureId: f.fixture.id,
              homeTeam: f.teams.home.name,
              awayTeam: f.teams.away.name,
              homeLogo: f.teams.home.logo,
              awayLogo: f.teams.away.logo,
              lastHomeGoals: f.goals.home,
              lastAwayGoals: f.goals.away,
              createdAt: Date.now(),
            });
            if (pushEndpointRef.current) {
              syncFollowToServer(pushEndpointRef.current, f.fixture.id, "goal_alert", "add");
            }
          }
        }
        return next;
      });
    }
  }, [addToast]);

  const checkMatchEvents = useCallback(async (fixtures: Fixture[]) => {
    const followedIds = Array.from(goalAlertsRef.current.keys());
    if (followedIds.length === 0) return;

    const fixtureMap = new Map(fixtures.map((f) => [f.fixture.id, f]));

    for (const fixtureId of followedIds) {
      const fixtureData = fixtureMap.get(fixtureId);
      if (fixtureData && isFinished(fixtureData.fixture.status.short)) continue;

      try {
        const res = await fetch(`/api/fixtures/${fixtureId}/events`);
        if (!res.ok) continue;
        const data = await res.json();
        const events = data?.response || [];

        const prevCount = eventsCountRef.current.get(fixtureId) ?? 0;
        if (events.length <= prevCount) {
          eventsCountRef.current.set(fixtureId, events.length);
          continue;
        }

        const alert = goalAlertsRef.current.get(fixtureId);
        if (!alert) continue;
        const matchLabel = `${alert.homeTeam} vs ${alert.awayTeam}`;
        const newEvents = events.slice(prevCount);

        for (const evt of newEvents) {
          if (evt.type === "Goal" && evt.detail === "Penalty") {
            const title = translate("en", "notif.penalty", { player: evt.player?.name || "?" });
            addToast({ type: "penalty", title, body: matchLabel, fixtureId });
          }
        }

        eventsCountRef.current.set(fixtureId, events.length);
      } catch { /* silent */ }
    }
  }, [addToast]);

  useEffect(() => {
    if (!mounted) return;
    const hasAny = () => remindersRef.current.size > 0 || goalAlertsRef.current.size > 0;
    if (!hasAny()) return;

    const poll = async () => {
      if (!hasAny()) return;
      try {
        const today = getDateOffset(0);
        const res = await fetch(`/api/fixtures?date=${today}`);
        const data = await res.json();
        if (data.response) {
          if (remindersRef.current.size > 0) checkReminders(data.response);
          if (goalAlertsRef.current.size > 0) {
            checkGoalUpdates(data.response);
            checkMatchEvents(data.response);
          }
        }
      } catch { /* silent */ }
    };

    const interval = setInterval(poll, 8000);
    poll();
    return () => clearInterval(interval);
  }, [mounted, checkReminders, checkGoalUpdates, checkMatchEvents]);

  return (
    <NotificationContext.Provider
      value={{
        reminders,
        goalAlerts,
        toasts,
        addReminder,
        removeReminder,
        hasReminder,
        toggleGoalAlert,
        hasGoalAlert,
        checkGoalUpdates,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
