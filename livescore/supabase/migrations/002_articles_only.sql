-- Run this in Supabase SQL Editor if articles table is missing
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

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read articles" ON articles;
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);
