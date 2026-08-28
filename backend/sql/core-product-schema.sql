-- ============================================================================
-- Ventus core product schema (baseline)
-- ============================================================================
--
-- WHY THIS FILE EXISTS
--   The core product tables below already live in Aurora/RDS but their DDL was
--   never version-controlled. That means the schema of record only existed in
--   the running database, which is a reproducibility / change-control / audit
--   gap (SOC2 CC8 change management, plus no way to stand up a fresh DB or run
--   schema checks in CI). This file captures that schema as an idempotent
--   baseline so future changes go through the repo.
--
-- HOW IT WAS DERIVED
--   These CREATE TABLE statements were reconstructed from the code that reads
--   and writes each table (the INSERT/UPDATE/SELECT column lists in the
--   pipeline Lambdas + ventus-api), not from a live pg_dump. Column NAMES match
--   the code exactly; column TYPES are inferred from how each value is produced
--   and should be treated as best-effort until reconciled against Aurora.
--     transactions_raw          -> ventus-ingest-transactions, ventus-classify-transactions
--     transactions_enriched     -> ventus-classify-transactions, ventus-analyze-pillar-transactions
--     merchant_cache            -> ventus-classify-transactions
--     pipeline_runs             -> ingest / classify / pillar / risk / travel / lifestyle stages
--     customer_pillar_profiles  -> ventus-analyze-pillar-transactions
--     customer_life_events      -> ventus-analyze-lifestyle-signals (life_event + behavioral)
--     life_event_evidence       -> ventus-analyze-lifestyle-signals
--     customer_risk_factors     -> ventus-risk-detection
--     customer_trips            -> ventus-travel-detection
--     api_keys                  -> ventus-api (auth middleware)
--     webhook_registrations     -> ventus-api (webhook management)
--
-- HOW TO VERIFY AGAINST AURORA (do this before trusting it as source of truth)
--   Dump the real schema and diff it against this file:
--     pg_dump --schema-only --no-owner --no-privileges \
--       -t transactions_raw -t transactions_enriched -t merchant_cache \
--       -t pipeline_runs -t customer_pillar_profiles -t customer_life_events \
--       -t life_event_evidence -t customer_risk_factors -t customer_trips \
--       -t api_keys -t webhook_registrations \
--       "$DATABASE_URL" > /tmp/aurora-core-schema.sql
--   Then reconcile any differences here (types, defaults, constraints, indexes),
--   and flip the "VERIFY" notes below once confirmed. Every statement is
--   IF NOT EXISTS / ADD COLUMN IF NOT EXISTS so applying it against the live DB
--   is a no-op where the objects already exist.
-- ============================================================================


-- ─── transactions_raw ───────────────────────────────────────────────────────
-- Landing table for ingested transactions before enrichment.
CREATE TABLE IF NOT EXISTS transactions_raw (
  transaction_id    TEXT PRIMARY KEY,
  customer_id       TEXT NOT NULL,
  bank_id           TEXT NOT NULL,
  batch_id          TEXT,
  raw_merchant      TEXT,
  amount            NUMERIC(14,2),
  transaction_date  DATE,
  mcc_code          TEXT,
  zip_code          TEXT,
  home_zip          TEXT,
  source_file       TEXT,
  processed         BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_transactions_raw_customer_batch_unprocessed
  ON transactions_raw (customer_id, batch_id, processed);
CREATE INDEX IF NOT EXISTS idx_transactions_raw_bank
  ON transactions_raw (bank_id);


-- ─── merchant_cache ─────────────────────────────────────────────────────────
-- Merchant classification cache keyed by the raw merchant string.
CREATE TABLE IF NOT EXISTS merchant_cache (
  raw_name      TEXT PRIMARY KEY,
  clean_name    TEXT,
  pillar        TEXT,
  subcategory   TEXT,
  confidence    NUMERIC,
  hit_count     INTEGER NOT NULL DEFAULT 0,
  last_updated  TIMESTAMPTZ
);


-- ─── transactions_enriched ──────────────────────────────────────────────────
-- Enriched transactions produced by classify + pillar analysis. Base columns
-- are written by classify; the tax/inferred-purchase columns are filled in by
-- the pillar-analysis stage.
CREATE TABLE IF NOT EXISTS transactions_enriched (
  transaction_id       TEXT PRIMARY KEY,
  customer_id          TEXT NOT NULL,
  bank_id              TEXT NOT NULL,
  batch_id             TEXT,
  amount               NUMERIC(14,2),
  transaction_date     DATE,
  zip_code             TEXT,
  clean_merchant_name  TEXT,
  lifestyle_category   TEXT,
  merchant_category    TEXT,
  confidence_score     NUMERIC,
  inferred_purchase    TEXT,
  purchase_confidence  NUMERIC,
  pre_tax_amount       NUMERIC(14,2),
  tax_amount           NUMERIC(14,2),
  tax_rate             NUMERIC,
  tax_state            TEXT,
  enriched_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transactions_enriched_bank_customer
  ON transactions_enriched (bank_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_enriched_bank_lifestyle
  ON transactions_enriched (bank_id, lifestyle_category);


-- ─── pipeline_runs ──────────────────────────────────────────────────────────
-- One row per (batch, customer); tracks progress across pipeline stages.
-- Column set matches stuck-pipeline-runs.sql.
CREATE TABLE IF NOT EXISTS pipeline_runs (
  batch_id              TEXT NOT NULL,
  customer_id           TEXT NOT NULL,
  bank_id               TEXT NOT NULL,
  source_file           TEXT,
  transaction_count     INTEGER,
  status                TEXT,
  stages_complete       INTEGER NOT NULL DEFAULT 0,
  error_message         TEXT,
  ingested_at           TIMESTAMPTZ,
  classified_at         TIMESTAMPTZ,
  pillar_analyzed_at    TIMESTAMPTZ,
  travel_detected_at    TIMESTAMPTZ,
  lifestyle_analyzed_at TIMESTAMPTZ,
  risk_analyzed_at      TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  -- Added by webhook-payload-v2-migration.sql; folded into the baseline so a
  -- fresh DB is complete. That migration stays idempotent for existing DBs.
  warnings                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  batch_outcome_event      TEXT,
  batch_outcome_webhook_at TIMESTAMPTZ,
  batch_stuck_webhook_at   TIMESTAMPTZ,
  PRIMARY KEY (batch_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status
  ON pipeline_runs (status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_bank_ingested
  ON pipeline_runs (bank_id, ingested_at DESC);


-- ─── customer_pillar_profiles ───────────────────────────────────────────────
-- Per-customer spend rollups by lifestyle pillar.
CREATE TABLE IF NOT EXISTS customer_pillar_profiles (
  customer_id          TEXT NOT NULL,
  bank_id              TEXT NOT NULL,
  pillar               TEXT NOT NULL,
  total_spend          NUMERIC(14,2),
  transaction_count    INTEGER,
  avg_transaction      NUMERIC(14,2),
  pct_of_total_spend   NUMERIC(9,4),
  last_purchase_date   DATE,
  total_pre_tax_spend  NUMERIC(14,2),
  total_tax_paid       NUMERIC(14,2),
  analyzed_at          TIMESTAMPTZ,
  PRIMARY KEY (customer_id, pillar, bank_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_pillar_profiles_bank
  ON customer_pillar_profiles (bank_id);


-- ─── customer_life_events ───────────────────────────────────────────────────
-- Canonical detected signals: event_category='life_event' (projected life
-- events with funding plans) and event_category='behavioral' (ongoing
-- behavioral signals). Both variants share this table.
-- VERIFY: `id` is assumed BIGSERIAL (code uses RETURNING id); confirm it is not
-- a UUID default in Aurora. Also confirm the natural-key uniqueness the code
-- relies on for its "is this new?" lookup (likely customer_id + bank_id +
-- event_name/signal_name).
CREATE TABLE IF NOT EXISTS customer_life_events (
  id                               BIGSERIAL PRIMARY KEY,
  customer_id                      TEXT NOT NULL,
  bank_id                          TEXT NOT NULL,
  batch_id                         TEXT,
  event_name                       TEXT,
  event_type                       TEXT,
  event_category                   TEXT,
  signal_category                  TEXT,
  signal_name                      TEXT,
  confidence                       NUMERIC,
  urgency_timeline                 TEXT,
  status                           TEXT,
  is_dismissed                     BOOLEAN NOT NULL DEFAULT FALSE,
  talking_points                   JSONB,
  next_steps                       JSONB,
  project_type                     TEXT,
  estimated_start_year             INTEGER,
  duration_years                   INTEGER,
  estimated_total_cost             NUMERIC(14,2),
  estimated_current_savings        NUMERIC(14,2),
  recommended_monthly_contribution NUMERIC(14,2),
  cost_breakdown                   JSONB,
  recommended_funding_sources      JSONB,
  recommended_products             JSONB,
  insight                          TEXT,
  insight_generated_at             TIMESTAMPTZ,
  detected_at                      TIMESTAMPTZ,
  first_detected_at                TIMESTAMPTZ,
  last_confirmed_at                TIMESTAMPTZ,
  webhook_fired_at                 TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customer_life_events_customer_bank
  ON customer_life_events (customer_id, bank_id);
CREATE INDEX IF NOT EXISTS idx_customer_life_events_bank_category
  ON customer_life_events (bank_id, event_category);
CREATE INDEX IF NOT EXISTS idx_customer_life_events_bank_signal_category
  ON customer_life_events (bank_id, signal_category);


-- ─── life_event_evidence ────────────────────────────────────────────────────
-- Transactions cited as evidence for a life event / behavioral signal.
-- VERIFY: `relevance` type — code writes model output straight through; confirm
-- whether Aurora stores it as text (short explanation) or numeric (score).
CREATE TABLE IF NOT EXISTS life_event_evidence (
  life_event_id  BIGINT NOT NULL REFERENCES customer_life_events(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  relevance      TEXT,
  PRIMARY KEY (life_event_id, transaction_id)
);


-- ─── customer_risk_factors ──────────────────────────────────────────────────
-- Financial-wellness risk flags detected per transaction.
CREATE TABLE IF NOT EXISTS customer_risk_factors (
  id                BIGSERIAL PRIMARY KEY,
  customer_id       TEXT NOT NULL,
  bank_id           TEXT NOT NULL,
  batch_id          TEXT,
  transaction_id    TEXT,
  category_group    TEXT,
  category_label    TEXT,
  severity          TEXT,
  merchant          TEXT,
  amount            NUMERIC(14,2),
  transaction_date  DATE,
  reason            TEXT,
  detected_at       TIMESTAMPTZ,
  webhook_fired_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customer_risk_factors_customer_batch
  ON customer_risk_factors (customer_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_customer_risk_factors_bank_severity
  ON customer_risk_factors (bank_id, severity);


-- ─── customer_trips ─────────────────────────────────────────────────────────
-- Detected/planned trips with per-category spend breakdown.
CREATE TABLE IF NOT EXISTS customer_trips (
  trip_id             TEXT NOT NULL,
  customer_id         TEXT NOT NULL,
  bank_id             TEXT NOT NULL,
  batch_id            TEXT,
  destination         TEXT,
  trip_start          DATE,
  trip_end            DATE,
  trip_duration_days  INTEGER,
  total_trip_spend    NUMERIC(14,2),
  transaction_count   INTEGER,
  transport_spend     NUMERIC(14,2),
  lodging_spend       NUMERIC(14,2),
  dining_spend        NUMERIC(14,2),
  activities_spend    NUMERIC(14,2),
  other_spend         NUMERIC(14,2),
  is_upcoming         BOOLEAN DEFAULT FALSE,
  detected_at         TIMESTAMPTZ,
  webhook_fired_at    TIMESTAMPTZ,
  PRIMARY KEY (trip_id, customer_id, bank_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_trips_bank_upcoming
  ON customer_trips (bank_id, is_upcoming);


-- ─── api_keys ───────────────────────────────────────────────────────────────
-- Per-bank API credentials used by the ventus-api auth middleware.
CREATE TABLE IF NOT EXISTS api_keys (
  key            TEXT PRIMARY KEY,
  bank_id        TEXT NOT NULL,
  ingest_format  TEXT DEFAULT 'normalized',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_bank
  ON api_keys (bank_id);


-- ─── webhook_registrations ──────────────────────────────────────────────────
-- Outbound webhook subscriptions per bank. Upsert key is (bank_id, url).
-- VERIFY: `events` is assumed TEXT[] (code passes a JS array param directly,
-- not JSON.stringify'd); confirm it is not JSONB in Aurora.
CREATE TABLE IF NOT EXISTS webhook_registrations (
  webhook_id  TEXT PRIMARY KEY,
  bank_id     TEXT NOT NULL,
  url         TEXT NOT NULL,
  events      TEXT[],
  secret      TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  UNIQUE (bank_id, url)
);

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_bank
  ON webhook_registrations (bank_id);
