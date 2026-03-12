-- Add content (rich text HTML) column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;
