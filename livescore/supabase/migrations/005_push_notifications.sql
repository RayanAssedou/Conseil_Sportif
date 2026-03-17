-- Push notification subscriptions (Web Push API)
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

-- Which fixtures each subscription follows
CREATE TABLE IF NOT EXISTS push_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  fixture_id INTEGER NOT NULL,
  follow_type TEXT NOT NULL CHECK (follow_type IN ('reminder', 'goal_alert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, fixture_id)
);

CREATE INDEX IF NOT EXISTS idx_push_follows_fixture ON push_follows(fixture_id);
CREATE INDEX IF NOT EXISTS idx_push_follows_sub ON push_follows(subscription_id);

-- Tracks last known match state for change detection by the cron job
CREATE TABLE IF NOT EXISTS match_push_states (
  fixture_id INTEGER PRIMARY KEY,
  home_goals INTEGER DEFAULT 0,
  away_goals INTEGER DEFAULT 0,
  status TEXT DEFAULT 'NS',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_push_states ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes with SUPABASE_SERVICE_KEY)
CREATE POLICY "Service role full access on push_subscriptions"
  ON push_subscriptions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on push_follows"
  ON push_follows FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on match_push_states"
  ON match_push_states FOR ALL
  USING (true) WITH CHECK (true);
