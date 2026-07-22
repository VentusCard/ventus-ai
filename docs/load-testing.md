# Load Testing & Bottleneck Finding

Guide for `backend/scripts/load-test-enrich.mjs` (npm script: `load:enrich`). The
script is both a **load tester** (drives synthetic traffic at `POST /v1/enrich`)
and a **bottleneck finder** (reports which pipeline stage is slow and, optionally,
correlates it against AWS infra metrics).

It is **Plaid-free**: it generates deterministic synthetic data. For real Plaid
data / accuracy testing use `npm run --prefix backend plaid:sandbox:pull` instead.

## TL;DR

```bash
# Smoke: validate the tool end-to-end (a few Gemini calls, a handful of rows)
VENTUS_API_KEY=<key> VENTUS_STAGING_API_BASE_URL=https://<staging-host> \
  LOAD_TEST_CUSTOMERS=2 npm run --prefix backend load:enrich

# Burst: one fixed wave of load
VENTUS_API_KEY=<key> VENTUS_STAGING_API_BASE_URL=https://<staging-host> \
  LOAD_TEST_CUSTOMERS=100 LOAD_TEST_CONCURRENCY=5 \
  npm run --prefix backend load:enrich

# Ramp + bottleneck hunt (find where throughput bends)
VENTUS_API_KEY=<key> VENTUS_STAGING_API_BASE_URL=https://<staging-host> \
  LOAD_TEST_DURATION_S=300 LOAD_TEST_RAMP=30,60,120,240 \
  LOAD_TEST_CUSTOMERS_PER_BATCH=10 LOAD_TEST_CONCURRENCY=20 \
  npm run --prefix backend load:enrich
```

## Safety first

- **Do not run a real load test against production.** Every accepted batch writes
  rows to the live database and triggers the full Gemini-backed pipeline (even in
  `ingest` mode — `/v1/enrich` still enqueues classify→enrich downstream). The
  script refuses `api.ventusai.com` unless `LOAD_TEST_ALLOW_PRODUCTION=true`.
- Run against a **staging/isolated target** with a **dedicated test API key** and,
  ideally, a **separate Gemini key** so you don't starve prod quota.
- Use **teardown** (below) to delete the synthetic rows afterward.

## What you get back

Output is printed in labeled sections:

1. **Config header** — echoes the run parameters (profile, rates, run_id, etc.).
2. **SUBMIT RESULTS** — ingestion throughput, accepted/failed/429 counts, submit
   latency percentiles. This is the load-tester core.
3. **PIPELINE RESULTS** (`e2e` mode only) — succeeded/partial/failed/timed-out
   batches and end-to-end "time to terminal" percentiles.
4. **PER-STAGE TIMING** — diffs the `/v1/jobs` per-customer timestamps and names
   the **slowest stage** (`ingest→classify`, `classify→pillar`, `classify→travel`,
   `classify→lifestyle`, `classify→risk`). This is the bottleneck finder.
5. **CLOUDWATCH CORRELATION** (opt-in) — Lambda throttles/errors/concurrency, SQS
   depth/age, Aurora connections/CPU for the run window, with auto-flags.
6. **Final verdict** — `PASSED` or `COMPLETED WITH ISSUES`; sets a non-zero exit
   code on submit/pipeline failures (CI-gate friendly).

## Profiles

### Burst (default)
One fixed wave. `LOAD_TEST_CUSTOMERS` total customers are packed into batches
(≤ `LOAD_TEST_MAX_BATCH` txns each, whole customers per batch) and submitted with
`LOAD_TEST_CONCURRENCY` in flight.

### Sustained / Ramp (`LOAD_TEST_DURATION_S > 0`)
Open-loop arrival generator: emits a fresh batch every `60000 / rate` ms for the
duration, capped at `LOAD_TEST_CONCURRENCY` in flight (so load is paced by target
rate until the system saturates, then by capacity — the regime where bottlenecks
surface). `LOAD_TEST_RAMP` splits the duration into equal phases stepping through
the listed rates.

## Environment variables

### Required
| Var | Description |
| --- | --- |
| `VENTUS_API_KEY` | API key for the target bank. Must match the key's configured `ingest_format`. |

### Target & common
| Var | Default | Description |
| --- | --- | --- |
| `VENTUS_STAGING_API_BASE_URL` | — | Target base URL (preferred). |
| `VENTUS_API_BASE_URL` | `https://api.ventusai.com` | Fallback base URL. |
| `LOAD_TEST_ALLOW_PRODUCTION` | `false` | `true` to allow `api.ventusai.com`. |
| `LOAD_TEST_INGEST_FORMAT` | `normalized` | `normalized` or `plaid`. Must match the key. |
| `LOAD_TEST_MODE` | `e2e` | `e2e` (poll to completion) or `ingest` (submit only). |
| `LOAD_TEST_TXNS_PER_CUSTOMER` | `10` | Transactions per customer. |
| `LOAD_TEST_CONCURRENCY` | `4` | Max in-flight enrich requests. |
| `LOAD_TEST_MAX_BATCH` | `1000` | Max txns per request (≤ 1000). |
| `LOAD_TEST_HOME_ZIP` | `10003` | Home/zip for generated rows. |
| `LOAD_TEST_POLL_TIMEOUT_MS` | `600000` | Per-batch poll timeout. |
| `LOAD_TEST_POLL_INTERVAL_MS` | `5000` | Poll interval. |

### Burst profile
| Var | Default | Description |
| --- | --- | --- |
| `LOAD_TEST_CUSTOMERS` | `10` | Total synthetic customers. |

### Sustained / ramp profile
| Var | Default | Description |
| --- | --- | --- |
| `LOAD_TEST_DURATION_S` | `0` | Seconds to keep submitting (`0` = burst). |
| `LOAD_TEST_RATE_PER_MIN` | `60` | Target batches/minute. |
| `LOAD_TEST_CUSTOMERS_PER_BATCH` | `10` | Customers per emitted batch. |
| `LOAD_TEST_RAMP` | — | Comma list of rates/min, e.g. `30,60,120,240`. |

### CloudWatch correlation (opt-in)
Requires `@aws-sdk/client-cloudwatch` (dynamically imported) and AWS creds.
Install once: `npm i --prefix backend @aws-sdk/client-cloudwatch`.

| Var | Default | Description |
| --- | --- | --- |
| `LOAD_TEST_CLOUDWATCH` | `false` | `true` to pull infra metrics for the run window. |
| `AWS_REGION` | `us-east-2` | Region for the metrics. |
| `LOAD_TEST_LAMBDAS` | the 7 pipeline functions | Comma list of Lambda FunctionNames. |
| `LOAD_TEST_SQS_QUEUES` | — | Comma list of SQS QueueNames. |
| `LOAD_TEST_RDS_CLUSTER` | — | Aurora `DBClusterIdentifier`. |
| `LOAD_TEST_DB_MAX_CONNECTIONS` | — | Connection ceiling, used to flag "near limit". |

Example with the real prod resource names (point at staging equivalents in practice):

```bash
LOAD_TEST_CLOUDWATCH=true AWS_REGION=us-east-2 \
  LOAD_TEST_SQS_QUEUES=ventus-classify-queue,ventus-pillar-queue,ventus-lifestyle-queue,ventus-risk-queue,ventus-travel-queue \
  LOAD_TEST_RDS_CLUSTER=ventus-bofa-cluster LOAD_TEST_DB_MAX_CONNECTIONS=200 \
  ...
```

### Teardown (DB cleanup)
Requires the `pg` package (dynamically imported) and a DB connection.
Install once: `npm i --prefix backend pg`.

| Var | Default | Description |
| --- | --- | --- |
| `LOAD_TEST_TEARDOWN` | `false` | `true` to delete this run's rows after it finishes. |
| `LOAD_TEST_TEARDOWN_RUN_ID` | — | Comma list of prior `run_id`s to delete, then exit (cleanup-only; submits no load). |
| `DATABASE_URL` | — | Postgres connection string (or use standard `PG*` env vars). |
| `LOAD_TEST_DB_SSL` | `true` | `false` to disable TLS (RDS needs TLS). |

Every synthetic row's `customer_id` / `transaction_id` starts with
`loadtest_<run_id>_`, so teardown deletes only that run's data, across:
`transactions_raw`, `transactions_enriched`, `pipeline_runs`,
`customer_pillar_profiles`, `customer_trips`, `customer_risk_factors`,
`customer_life_events`, and `life_event_evidence`. Deletes run in a transaction,
children before parents. `merchant_cache` is intentionally **not** touched (it is
keyed by real merchant names and shared globally).

```bash
# Self-cleaning run
VENTUS_API_KEY=<key> VENTUS_STAGING_API_BASE_URL=https://<staging-host> \
  DATABASE_URL=postgres://user:pass@host:5432/db LOAD_TEST_TEARDOWN=true \
  LOAD_TEST_CUSTOMERS=50 npm run --prefix backend load:enrich

# Cleanup-only: delete earlier runs and exit (no load)
DATABASE_URL=postgres://user:pass@host:5432/db \
  LOAD_TEST_TEARDOWN_RUN_ID=20260622211221,20260622212800 \
  npm run --prefix backend load:enrich
```

> Note: teardown is best-effort. If a batch timed out (non-terminal), a slow
> Lambda may write a row after deletion. Re-run cleanup-only with that `run_id`
> later to sweep stragglers.

## Reading the results

- **429s / 5xx in SUBMIT** → ingestion or quota backpressure at the front door.
- **Slowest stage in PER-STAGE TIMING** → where to add capacity. The Gemini-backed
  stages (classify/pillar/travel/lifestyle/risk) are the usual long poles.
- **CloudWatch flags** tie it together:
  - Lambda `THROTTLED` → raise reserved/provisioned concurrency.
  - SQS `BACKLOG` (oldest-message age climbing) → consumers behind producers.
  - Aurora `NEAR LIMIT` connections → DB connection pressure (no pooling today).

## Limitations

- Synthetic, uniform data — proves the pipeline **runs** at scale, not that
  classifications are **correct** (use the Plaid golden-eval pipeline for accuracy).
- Format is a property of the API key: a `normalized` body sent to a `plaid` key
  (or vice-versa) is rejected with `400` — set `LOAD_TEST_INGEST_FORMAT` to match.
- Numbers are only trustworthy against an isolated target, not production.
