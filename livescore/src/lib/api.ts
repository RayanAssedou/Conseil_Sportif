const API_URL = process.env.API_FOOTBALL_URL || "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY || "";

export async function fetchFromAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchFixturesLive() {
  return fetchFromAPI("fixtures", { live: "all" });
}

export async function fetchFixturesByDate(date: string) {
  return fetchFromAPI("fixtures", { date });
}

export async function fetchFixtureById(id: string) {
  return fetchFromAPI("fixtures", { id });
}

export async function fetchFixtureStatistics(fixtureId: string) {
  return fetchFromAPI("fixtures/statistics", { fixture: fixtureId });
}

export async function fetchFixtureEvents(fixtureId: string) {
  return fetchFromAPI("fixtures/events", { fixture: fixtureId });
}

export async function fetchFixtureLineups(fixtureId: string) {
  return fetchFromAPI("fixtures/lineups", { fixture: fixtureId });
}

export async function fetchFixturePlayers(fixtureId: string) {
  return fetchFromAPI("fixtures/players", { fixture: fixtureId });
}
