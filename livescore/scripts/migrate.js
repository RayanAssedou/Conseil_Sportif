const { Client } = require("pg");

const SQL = `
-- Hero / Banner configuration
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

-- Section settings
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

-- Articles
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

-- RLS
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read hero_config" ON hero_config;
CREATE POLICY "Allow public read hero_config" ON hero_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read section_settings" ON section_settings;
CREATE POLICY "Allow public read section_settings" ON section_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read articles" ON articles;
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);

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
`;

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL in .env.local");
    console.error("Format: postgresql://postgres:[PASSWORD]@db.kyxmmfelzwbsumalyoqs.supabase.co:5432/postgres");
    console.error("Get password from Supabase Dashboard → Settings → Database");
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(SQL);
    console.log("Migration OK");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();