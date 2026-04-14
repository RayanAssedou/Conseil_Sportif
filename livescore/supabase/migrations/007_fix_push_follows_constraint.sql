-- Allow both 'reminder' and 'goal_alert' follow types for the same subscription+fixture.
-- The old UNIQUE(subscription_id, fixture_id) prevented this, causing overwrites.
ALTER TABLE push_follows DROP CONSTRAINT IF EXISTS push_follows_subscription_id_fixture_id_key;
ALTER TABLE push_follows ADD CONSTRAINT push_follows_sub_fixture_type_key UNIQUE(subscription_id, fixture_id, follow_type);
