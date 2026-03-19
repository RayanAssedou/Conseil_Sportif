const API_URL = process.env.API_FOOTBALL_URL || "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY || "";

const CACHE_TTL_MS = 10_000;
const apiCache = new Map<string, { data: unknown; ts: number }>();

export async function fetchFromAPI(
  endpoint: string,
  params: Record<string, string> = {},
  options?: { skipCache?: boolean }
) {
  const url = new URL(`${API_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const cacheKey = url.toString();
  if (!options?.skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  apiCache.set(cacheKey, { data, ts: Date.now() });

  if (apiCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of apiCache) {
      if (now - v.ts > CACHE_TTL_MS) apiCache.delete(k);
    }
  }

  return data;
}

export async function fetchFixturesLive() {
  return fetchFromAPI("fixtures", { live: "all" });
}

export async function fetchFixturesByDate(date: string) {
  return fetchFromAPI("fixtures", { date });
}

export async function fetchFixtureById(id: string, options?: { skipCache?: boolean }) {
  return fetchFromAPI("fixtures", { id }, options);
}

export async function fetchFixtureStatistics(fixtureId: string) {
  return fetchFromAPI("fixtures/statistics", { fixture: fixtureId });
}

export async function fetchFixtureEvents(fixtureId: string, options?: { skipCache?: boolean }) {
  return fetchFromAPI("fixtures/events", { fixture: fixtureId }, options);
}

export async function fetchFixtureLineups(fixtureId: string) {
  return fetchFromAPI("fixtures/lineups", { fixture: fixtureId });
}

export async function fetchFixturePlayers(fixtureId: string) {
  return fetchFromAPI("fixtures/players", { fixture: fixtureId });
}
