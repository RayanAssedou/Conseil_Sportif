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

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read predictions" ON predictions;
CREATE POLICY "Allow public read predictions" ON predictions FOR SELECT USING (true);
