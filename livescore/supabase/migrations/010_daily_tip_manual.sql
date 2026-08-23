-- Make the Daily Tip self-contained: it stores its own match + manually
-- entered score/advice/probabilities (like a prediction), independent of the
-- public predictions list. featured_fixture_id keeps the fixture id for linking.
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS home_team TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS away_team TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS home_logo TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS away_logo TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS league_name TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS predicted_home TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS predicted_away TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS advice TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS prob_home TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS prob_draw TEXT;
ALTER TABLE daily_tip ADD COLUMN IF NOT EXISTS prob_away TEXT;
