-- Atomic dedup log for push notifications.
-- Each (subscription_id, tag) tuple may only be inserted once, so concurrent
-- cron workers racing on the same event cannot both succeed in claiming it.
-- The cron periodically prunes rows older than 24h.

CREATE TABLE IF NOT EXISTS push_sent_log (
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (subscription_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_push_sent_log_sent_at ON push_sent_log(sent_at);

ALTER TABLE push_sent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on push_sent_log" ON push_sent_log;
CREATE POLICY "Service role full access on push_sent_log"
  ON push_sent_log FOR ALL
  USING (true) WITH CHECK (true);
