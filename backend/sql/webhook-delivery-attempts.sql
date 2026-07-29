CREATE TABLE IF NOT EXISTS webhook_delivery_attempts (
  delivery_id UUID PRIMARY KEY,
  webhook_id TEXT,
  bank_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  payload_sha256 TEXT NOT NULL,
  payload_json JSONB,
  replay_of_delivery_id UUID REFERENCES webhook_delivery_attempts(delivery_id),
  attempt_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('delivered', 'failed')),
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_attempts_bank_last_attempted
  ON webhook_delivery_attempts (bank_id, last_attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_attempts_webhook_last_attempted
  ON webhook_delivery_attempts (webhook_id, last_attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_attempts_status_last_attempted
  ON webhook_delivery_attempts (status, last_attempted_at DESC);

ALTER TABLE webhook_delivery_attempts
  ADD COLUMN IF NOT EXISTS payload_json JSONB;

ALTER TABLE webhook_delivery_attempts
  ADD COLUMN IF NOT EXISTS replay_of_delivery_id UUID REFERENCES webhook_delivery_attempts(delivery_id);
