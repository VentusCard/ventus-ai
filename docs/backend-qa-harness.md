# Backend QA Harness

This harness is scoped to backend pilot readiness. It does not change UI/UX, enrichment taxonomy, prompts, or enriched output behavior.

## What It Checks

- Mock-bank input payloads for FIS, Fiserv, Jack Henry, provider-agnostic multi-rail normalized transaction feeds, and a canonical adversarial enrichment set.
- Provider-agnostic rail/profile coverage for card, ACH, bill pay, P2P, wire, ATM cash, refund, fee, and merchant-integration signals.
- Adversarial enrichment edge cases for lookalike merchants, ambiguous brands, large legitimate purchases, garbled merchant strings, and dual-category merchants.
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
npm run --prefix backend qa:golden
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
- Golden enrichment expectations: `backend/fixtures/evaluation/golden-enrichment-expectations.json`
- Multi-rail profile taxonomy: `backend/fixtures/evaluation/multirail-profile-taxonomy.json`

## Golden Enrichment QA

The golden expectation layer defines expected classification outcomes for the current mock FIS, Fiserv, Jack Henry, provider-agnostic multi-rail, and adversarial transaction fixtures. It is test harness data, not a production enriched dataset.

The CI-safe mode validates that every expected transaction still maps to a source fixture and has an expected rail, source profile, transaction type, clean merchant name, lifestyle category, merchant category, minimum confidence threshold, and downstream signal flags for travel, risk, and life-event candidates.

`source_system` is metadata for fixture provenance and intent. The behavior under test is defined by:

- `rail`: card, ACH, bill pay, P2P, wire, or merchant integration
- `source_profile`: the provider-agnostic transaction pattern, such as `card_travel`, `ach_payroll`, or `wire_transfer`
- `transaction_type`: debit, credit, or signal

### Test Layers

The fixtures fall into two layers, each addressing a different concern:

1. **Reference style fixtures** (`fis-card-transactions.json`, `fiserv-card-transactions.json`, `jack-henry-card-transactions.json`, `multirail-transactions.json`) — representative transactions from each processor or rail. These exercise rail/profile coverage breadth and provide CI smoke coverage across realistic inputs.
2. **Adversarial enrichment fixtures** (`adversarial-enrichment-transactions.json`) — canonical, processor-agnostic transactions designed to surface specific failure modes. Each adversarial expectation carries a `category` and a `rationale` explaining what is being guarded against:
   - `lookalike` — merchant names that share tokens with a different category (e.g. "Delta Dental" vs Delta airlines)
   - `ambiguous_brand` — multi-purpose brands disambiguated by MCC or merchant suffix (e.g. APPLE.COM/BILL vs APPLE STORE)
   - `large_legitimate` — large amounts at known retailers that must not be flagged as risk on amount alone
   - `garbled_merchant` — payment-processor prefixes, location suffixes, and extra whitespace that the cleaner must strip
   - `dual_category` — merchants that sell multiple categories where MCC must disambiguate
   - `missing_field` — resilience to absent MCC, ZIP, or other optional fields

True raw-processor-format parser tests (FIS / Fiserv / Jack Henry record formats prior to normalization) are not in scope here and remain a separate future initiative.

### Negative Signal Assertions

`expected_signals.travel_candidate`, `expected_signals.risk_candidate`, and `expected_signals.life_event_candidate` are enforced in both directions when predictions are supplied. A `false` value asserts the signal must not be flagged, catching false-positive classifications.

New integration partners should map into these profiles or add new profiles to `multirail-profile-taxonomy.json` before adding golden expectations.

To compare actual model/API output against the golden set, provide a JSON file containing either an array or `{ "predictions": [...] }` with `transaction_id`, `clean_merchant_name`, `lifestyle_category`, `merchant_category`, `confidence_score`, and `signals.{travel_candidate, risk_candidate, life_event_candidate}` (or those signal keys at the top level of each prediction).

```sh
VENTUS_QA_PREDICTIONS_PATH=/path/to/predictions.json npm run --prefix backend qa:golden
```

## How This Helps Pilot Readiness

The first layer catches contract drift before code is promoted to staging or production. The next layer should reuse these validators against a staging API with a staging API key and known QA customer IDs, then add latency and stage-completion assertions for the full enrichment lifecycle.
