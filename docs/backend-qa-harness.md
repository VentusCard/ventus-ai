# Backend QA Harness

This harness is scoped to backend pilot readiness. It does not change UI/UX, enrichment taxonomy, prompts, or enriched output behavior.

## What It Checks

- Mock-bank input payloads for FIS, Fiserv, and Jack Henry style normalized transaction feeds.
- Required `POST /v1/enrich` input fields: transaction ID, customer ID, merchant name, amount, date, MCC, ZIP, and home ZIP.
- Representative downstream response contracts for:
  - `POST /v1/enrich`
  - `GET /v1/jobs/{job_id}`
  - `GET /v1/customers/{customer_id}/transactions`
  - `GET /v1/customers/{customer_id}/life-events`
  - `GET /v1/customers/{customer_id}/trips`
  - `GET /v1/customers/{customer_id}/risk-factors`
  - `GET /v1/analytics/bank`
  - `POST /v1/webhooks`

## Run Locally

```sh
npm run --prefix backend qa:enrichment
```

## Run Against Staging Or Live API

Health-only mode:

```sh
VENTUS_STAGING_API_BASE_URL=https://staging-api.example.com npm run --prefix backend qa:live
```

Authenticated read checks:

```sh
VENTUS_STAGING_API_BASE_URL=https://staging-api.example.com \
VENTUS_API_KEY=... \
VENTUS_LIVE_QA_CUSTOMER_ID=qa_customer_001 \
npm run --prefix backend qa:live
```

Submit a QA enrichment job and poll it to completion:

```sh
VENTUS_STAGING_API_BASE_URL=https://staging-api.example.com \
VENTUS_API_KEY=... \
VENTUS_LIVE_QA_ENABLE_WRITE=true \
npm run --prefix backend qa:live
```

The live runner refuses to submit fixture transactions to `https://api.ventusai.com` unless `VENTUS_LIVE_QA_ALLOW_PRODUCTION=true` is also set.

Useful optional settings:

- `VENTUS_LIVE_QA_FIXTURE`: path to a fixture JSON file.
- `VENTUS_LIVE_QA_TIMEOUT_MS`: job polling timeout, default `180000`.
- `VENTUS_LIVE_QA_POLL_INTERVAL_MS`: job polling interval, default `5000`.

## Fixture Locations

- Mock-bank input fixtures: `backend/fixtures/mock-bank/`
- API response examples: `backend/fixtures/contracts/api-response-examples.json`

## How This Helps Pilot Readiness

The first layer catches contract drift before code is promoted to staging or production. The next layer should reuse these validators against a staging API with a staging API key and known QA customer IDs, then add latency and stage-completion assertions for the full enrichment lifecycle.
