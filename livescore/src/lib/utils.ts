import { Fixture, LeagueGroup } from "./types";
import { translate, Locale } from "./i18n";

export function groupFixturesByLeague(fixtures: Fixture[]): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();

  for (const fixture of fixtures) {
    const leagueId = fixture.league.id;
    if (!map.has(leagueId)) {
      map.set(leagueId, {
        league: {
          id: fixture.league.id,
          name: fixture.league.name,
          country: fixture.league.country,
          logo: fixture.league.logo,
          flag: fixture.league.flag,
        },
        fixtures: [],
      });
    }
    map.get(leagueId)!.fixtures.push(fixture);
  }

  const groups = Array.from(map.values());
  groups.sort((a, b) => {
    const priorityLeagues = [39, 140, 135, 78, 61, 2, 3, 848, 1];
    const aIdx = priorityLeagues.indexOf(a.league.id);
    const bIdx = priorityLeagues.indexOf(b.league.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.league.country.localeCompare(b.league.country);
  });

  return groups;
}

export function isLive(status: string): boolean {
  const liveStatuses = ["1H", "2H", "HT", "ET", "P", "BT", "LIVE", "INT"];
  return liveStatuses.includes(status);
}

export function isFinished(status: string): boolean {
  const finishedStatuses = ["FT", "AET", "PEN", "WO", "AWD"];
  return finishedStatuses.includes(status);
}

export function isUpcoming(status: string): boolean {
  const upcomingStatuses = ["TBD", "NS", "PST", "CANC", "SUSP", "ABD"];
  return upcomingStatuses.includes(status);
}

export function getStatusDisplay(fixture: Fixture, locale: Locale = "en"): string {
  const { status } = fixture.fixture;
  if (status.short === "HT") return translate(locale, "common.halfTime");
  if (status.short === "FT") return translate(locale, "common.fullTime");
  if (status.short === "AET") return "AET";
  if (status.short === "PEN") return "PEN";
  if (status.short === "NS") {
    const date = new Date(fixture.fixture.date);
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (status.short === "PST") return translate(locale, "common.postponed");
  if (status.short === "CANC") return translate(locale, "common.cancelled");
  if (status.short === "SUSP") return translate(locale, "common.suspended");
  if (status.short === "ABD") return translate(locale, "common.abandoned");
  if (isLive(status.short)) {
    const elapsed = status.elapsed || 0;
    const extra = status.extra;
    if (extra) return `${elapsed}+${extra}'`;
    return `${elapsed}'`;
  }
  return status.short;
}

export function formatDate(dateStr: string, locale: Locale = "en"): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDateOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
}

export function getShortDate(dateStr: string, locale: Locale = "en"): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return translate(locale, "predictions.today");
  if (diff === 1) return translate(locale, "predictions.tomorrow");
  if (diff === -1) return translate(locale, "predictions.yesterday");

  return date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}
