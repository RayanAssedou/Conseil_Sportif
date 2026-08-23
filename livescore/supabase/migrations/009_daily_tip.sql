-- Paid / active flag on user profiles.
-- Admins flip this on for users who have paid so they can see the daily tip.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Single-row table holding the one "Tip of the Day".
-- The tip is a featured prediction: it points to a row in the predictions
-- table (by fixture_id) so the same rich card as the Predictions tab is shown.
CREATE TABLE IF NOT EXISTS daily_tip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  featured_fixture_id INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If an earlier version of this table already exists, make sure the column is present.
ALTER TABLE daily_tip
  ADD COLUMN IF NOT EXISTS featured_fixture_id INT;

-- Seed the single row if the table is empty.
INSERT INTO daily_tip (featured_fixture_id)
SELECT NULL
WHERE NOT EXISTS (SELECT 1 FROM daily_tip LIMIT 1);

-- Keep the tip private: RLS on, no public read policy.
-- Only the server (service key) may read/write it, and it is served
-- exclusively to users whose is_active flag is true.
ALTER TABLE daily_tip ENABLE ROW LEVEL SECURITY;
