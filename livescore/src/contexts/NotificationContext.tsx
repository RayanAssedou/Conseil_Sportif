"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { Fixture } from "@/lib/types";
import { translate, Locale } from "@/lib/i18n";
import { isLive, isFinished, getDateOffset } from "@/lib/utils";

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
}

export interface NotifToast {
  id: string;
  type: "kickoff" | "goal";
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

function sendBrowserNotif(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Map<number, ReminderData>>(new Map());
  const [goalAlerts, setGoalAlerts] = useState<Map<number, GoalAlertData>>(new Map());
  const [toasts, setToasts] = useState<NotifToast[]>([]);
  const [mounted, setMounted] = useState(false);

  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;
  const goalAlertsRef = useRef(goalAlerts);
  goalAlertsRef.current = goalAlerts;

  useEffect(() => {
    setReminders(loadMap<ReminderData>(LS_REMINDERS));
    setGoalAlerts(loadMap<GoalAlertData>(LS_GOAL_ALERTS));
    setMounted(true);
  }, []);

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
    await requestPermission();
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
  }, []);

  const removeReminder = useCallback((fixtureId: number) => {
    setReminders((prev) => {
      const next = new Map(prev);
      next.delete(fixtureId);
      return next;
    });
  }, []);

  const hasReminder = useCallback((fixtureId: number) => reminders.has(fixtureId), [reminders]);

  const toggleGoalAlert = useCallback(async (fixture: Fixture) => {
    await requestPermission();
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
        });
      }
      return next;
    });
  }, []);

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
          changed = true;
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
          const savedLocale = (typeof window !== "undefined" ? localStorage.getItem("site-lang") : "en") as Locale || "en";
          const title = translate(savedLocale, "notif.goal", { scorer });
          const body = `${alert.homeTeam} ${newHome} - ${newAway} ${alert.awayTeam}`;

          sendBrowserNotif(title, body);
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
          const savedLocale = (typeof window !== "undefined" ? localStorage.getItem("site-lang") : "en") as Locale || "en";
          const title = translate(savedLocale, "notif.matchStarted");
          const body = translate(savedLocale, "notif.matchLive", { homeTeam: reminder.homeTeam, awayTeam: reminder.awayTeam });
          sendBrowserNotif(title, body);
          addToast({ type: "kickoff", title, body, fixtureId: f.fixture.id });
          promoted.push(f);
          next.delete(f.fixture.id);
          changed = true;
        } else if (isFinished(f.fixture.status.short)) {
          next.delete(f.fixture.id);
          changed = true;
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
            });
          }
        }
        return next;
      });
    }
  }, [addToast]);

  useEffect(() => {
    if (!mounted) return;
    const hasAny = () => remindersRef.current.size > 0;
    if (!hasAny()) return;

    const poll = async () => {
      if (!hasAny()) return;
      try {
        const today = getDateOffset(0);
        const res = await fetch(`/api/fixtures?date=${today}`);
        const data = await res.json();
        if (data.response) {
          checkReminders(data.response);
        }
      } catch { /* silent */ }
    };

    const interval = setInterval(poll, 30000);
    poll();
    return () => clearInterval(interval);
  }, [mounted, checkReminders]);

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
