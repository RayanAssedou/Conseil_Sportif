import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, verifyAdminSession } from "@/lib/admin-auth";

const SQL = `
CREATE TABLE IF NOT EXISTS hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Football Hub',
  subtitle TEXT NOT NULL DEFAULT 'Your one-stop destination for live scores, expert predictions, and the latest football news from around the world.',
  background_type TEXT NOT NULL DEFAULT 'color' CHECK (background_type IN ('color', 'image')),
  background_value TEXT DEFAULT '#dc2626',
  button1_text TEXT NOT NULL DEFAULT 'Live Scores',
  button1_link TEXT NOT NULL DEFAULT '/scores',
  button1_bg_color TEXT DEFAULT '#ffffff',
  button1_text_color TEXT DEFAULT '#dc2626',
  button2_text TEXT NOT NULL DEFAULT 'Predictions',
  button2_link TEXT NOT NULL DEFAULT '/pronostics',
  button2_bg_color TEXT DEFAULT 'rgba(255,255,255,0.15)',
  button2_text_color TEXT DEFAULT '#ffffff',
  button2_border_color TEXT DEFAULT 'rgba(255,255,255,0.2)',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO hero_config (title, subtitle) 
SELECT 'Football Hub', 'Your one-stop destination for live scores, expert predictions, and the latest football news from around the world.'
WHERE NOT EXISTS (SELECT 1 FROM hero_config LIMIT 1);

CREATE TABLE IF NOT EXISTS section_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  view_all_text TEXT DEFAULT 'View all',
  view_all_link TEXT DEFAULT '/articles',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO section_settings (section_key, title, view_all_text, view_all_link)
VALUES ('latest_news', 'Latest News', 'View all', '/articles')
ON CONFLICT (section_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL DEFAULT 'Football',
  image_url TEXT,
  link TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  show_in_latest BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read hero_config" ON hero_config;
CREATE POLICY "Allow public read hero_config" ON hero_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read section_settings" ON section_settings;
CREATE POLICY "Allow public read section_settings" ON section_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read articles" ON articles;
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id INT NOT NULL UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  league_name TEXT,
  match_date TIMESTAMPTZ,
  predicted_home TEXT NOT NULL DEFAULT '0',
  predicted_away TEXT NOT NULL DEFAULT '0',
  advice TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prob_home TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prob_draw TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prob_away TEXT;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read predictions" ON predictions;
CREATE POLICY "Allow public read predictions" ON predictions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read user_profiles" ON user_profiles;
CREATE POLICY "Allow public read user_profiles" ON user_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow user update own profile" ON user_profiles;
CREATE POLICY "Allow user update own profile" ON user_profiles FOR ALL USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  referer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert page_views" ON page_views;
CREATE POLICY "Allow insert page_views" ON page_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read page_views" ON page_views;
CREATE POLICY "Allow public read page_views" ON page_views FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$tJRqf/ulKIuJr3J1CModW.EAuBGDv7FIACrqqE4uhlTJVKsg4kWfy')
ON CONFLICT (username) DO NOTHING;

-- Push notification tables
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);

CREATE TABLE IF NOT EXISTS push_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  fixture_id INTEGER NOT NULL,
  follow_type TEXT NOT NULL CHECK (follow_type IN ('reminder', 'goal_alert')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_follows_fixture ON push_follows(fixture_id);
CREATE INDEX IF NOT EXISTS idx_push_follows_sub ON push_follows(subscription_id);

CREATE TABLE IF NOT EXISTS match_push_states (
  fixture_id INTEGER PRIMARY KEY,
  home_goals INTEGER DEFAULT 0,
  away_goals INTEGER DEFAULT 0,
  status TEXT DEFAULT 'NS',
  events_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_push_states ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on push_subscriptions') THEN
    CREATE POLICY "Service role full access on push_subscriptions" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on push_follows') THEN
    CREATE POLICY "Service role full access on push_follows" ON push_follows FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on match_push_states') THEN
    CREATE POLICY "Service role full access on match_push_states" ON match_push_states FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Fix: allow both reminder AND goal_alert for the same subscription+fixture
ALTER TABLE push_follows DROP CONSTRAINT IF EXISTS push_follows_subscription_id_fixture_id_key;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'push_follows_sub_fixture_type_key'
  ) THEN
    ALTER TABLE push_follows ADD CONSTRAINT push_follows_sub_fixture_type_key UNIQUE(subscription_id, fixture_id, follow_type);
  END IF;
END $$;
`;

const PROJECT_REF = "kyxmmfelzwbsumalyoqs";

export async function POST(req: NextRequest) {
  const token = getAdminToken(req);
  const session = token ? await verifyAdminSession(token) : null;
  const key = req.headers.get("x-admin-key") || new URL(req.url).searchParams.get("key");
  const keyValid = key === process.env.ADMIN_SECRET;
  if (!session && !keyValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pat = process.env.SUPABASE_ACCESS_TOKEN;
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      const { Client } = await import("pg");
      const client = new Client({ connectionString: dbUrl });
      await client.connect();
      await client.query(SQL);
      await client.end();
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (!pat) {
    return NextResponse.json({
      error: "Add DATABASE_URL to .env.local (Supabase → Settings → Database → Connection string) or SUPABASE_ACCESS_TOKEN",
    }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err || `HTTP ${res.status}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
