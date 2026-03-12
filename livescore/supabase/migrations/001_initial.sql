-- Hero / Banner configuration (single row)
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

-- Section settings (Latest News header, View all link)
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

-- Articles (manual creation)
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

-- Enable RLS but allow all for now (use service key for admin)
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read hero_config" ON hero_config FOR SELECT USING (true);
CREATE POLICY "Allow public read section_settings" ON section_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);
