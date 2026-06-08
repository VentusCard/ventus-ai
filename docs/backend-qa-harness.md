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
npm run --prefix backend qa:partner-ingest
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
- Partner-ingest fixtures: `backend/fixtures/partner-ingest/`
- API response examples: `backend/fixtures/contracts/api-response-examples.json`
- Partner-ingest contracts: `backend/fixtures/evaluation/partner-ingest-contracts.json`
- Golden enrichment expectations: `backend/fixtures/evaluation/golden-enrichment-expectations.json`
- Multi-rail profile taxonomy: `backend/fixtures/evaluation/multirail-profile-taxonomy.json`

## Partner-Ingest QA

Partner-ingest QA validates the layer before enrichment: raw partner payloads must map cleanly into Ventus's normalized `POST /v1/enrich` transaction contract. This is the right place to catch Plaid, Fintech Sandbox, open-banking, processor, or CRM-specific shape drift before a model sees the data.

Current coverage includes a Plaid-style `/transactions/sync` fixture with:

- card merchant spend
- payroll ACH credit
- Zelle/P2P transfer
- large escrow wire
- pending-to-posted subscription update
- removed pending transaction

The corresponding normalized fixture asserts the expected Ventus fields:

- `transaction_id`
- `customer_id`
- `merchant_name`
- `amount`
- `date`
- `mcc_code`
- `zip_code`
- `home_zip`
- `rail`
- `source_profile`
- `transaction_type`
- `partner_metadata.source_transaction_id`

Partner-ingest QA also validates expected reject reports for records that should not reach enrichment. A reject report must include:

- summary counts for raw, accepted, rejected, and removed records
- one `rejected_records[]` entry per rejected source record
- stable reason codes such as `missing_account_customer_mapping`, `missing_home_zip_mapping`, or `missing_merchant_or_counterparty`
- a human-readable reason
- whether the record is retryable after mapping/data repair
- a small `raw_excerpt` for debugging without dumping entire payloads into logs

### Partner Data Intake Checklist

When a new Plaid or Fintech Sandbox sample arrives:

1. Store the original payload as a new `raw_partner_payload` fixture under `backend/fixtures/partner-ingest/`.
2. Add or update the expected `normalized_enrichment_input` fixture that maps each accepted raw transaction into the Ventus enrichment input shape.
3. Add or update the expected `partner_reject_report` fixture for rejected records, including explicit reason codes and raw excerpts.
4. Preserve partner-specific fields under `partner_metadata`; do not silently drop account IDs, source transaction IDs, category hints, pending IDs, or payment-channel hints.
5. Run `npm run --prefix backend qa:partner-ingest`.
6. Add golden expectations for the newly normalized transactions only after the mapping is stable.
7. Run `npm run --prefix backend qa:golden` with model/API predictions once outputs are available.

### Plaid-Specific Guardrails

Plaid transaction amounts use positive values when money moves out of the account and negative values when money moves in. Normalization must preserve this distinction so payroll, refunds, and credits are not evaluated as consumer spend.

Plaid payloads also include `added`, `modified`, and `removed` transaction sections. Only accepted `added` and `modified` transactions should be normalized for enrichment. `removed` transactions should drive reconciliation/delete handling, not new enrichment rows.

Malformed Plaid records should produce a reject report instead of a best-effort enrichment row. Current fixtures exercise two common cases: an unknown `account_id` with no customer/home-ZIP mapping and a record with no usable merchant, name, original description, or counterparty fallback.

## Golden Enrichment QA

The golden expectation layer defines expected classification outcomes for the current mock FIS, Fiserv, Jack Henry, provider-agnostic multi-rail, Plaid-style partner-ingest, and adversarial transaction fixtures. It is test harness data, not a production enriched dataset.

The CI-safe mode validates that every expected transaction still maps to a source fixture and has an expected rail, source profile, transaction type, clean merchant name, lifestyle category, merchant category, minimum confidence threshold, and downstream signal flags for travel, risk, and life-event candidates.

`source_system` is metadata for fixture provenance and intent. The behavior under test is defined by:

- `rail`: card, ACH, bill pay, P2P, wire, or merchant integration
- `source_profile`: the provider-agnostic transaction pattern, such as `card_travel`, `ach_payroll`, or `wire_transfer`
- `transaction_type`: debit, credit, or signal

### Test Layers

The fixtures fall into two layers, each addressing a different concern:

1. **Reference style fixtures** (`fis-card-transactions.json`, `fiserv-card-transactions.json`, `jack-henry-card-transactions.json`, `multirail-transactions.json`) — representative transactions from each processor or rail. These exercise rail/profile coverage breadth and provide CI smoke coverage across realistic inputs.
2. **Partner-ingest fixtures** (`plaid-transactions-sync-raw.json`, `plaid-transactions-sync-normalized.json`) — raw-to-normalized contract coverage for aggregator and Fintech Sandbox partner data before enrichment.
3. **Adversarial enrichment fixtures** (`adversarial-enrichment-transactions.json`) — canonical, processor-agnostic transactions designed to surface specific failure modes. Each adversarial expectation carries a `category` and a `rationale` explaining what is being guarded against:
   - `lookalike` — merchant names that share tokens with a different category (e.g. "Delta Dental" vs Delta airlines)
   - `ambiguous_brand` — multi-purpose brands disambiguated by MCC or merchant suffix (e.g. APPLE.COM/BILL vs APPLE STORE)
   - `large_legitimate` — large amounts at known retailers that must not be flagged as risk on amount alone
   - `garbled_merchant` — payment-processor prefixes, location suffixes, and extra whitespace that the cleaner must strip
   - `dual_category` — merchants that sell multiple categories where MCC must disambiguate
   - `missing_field` — resilience to absent MCC, ZIP, or other optional fields

True raw-processor-format parser tests (FIS / Fiserv / Jack Henry record formats prior to normalization) are not in scope here and remain a separate future initiative. Plaid-style and generic Fintech Sandbox partner ingest fixtures are now covered because those payloads are expected to arrive sooner and can vary materially from processor-normalized card examples.

### Negative Signal Assertions

`expected_signals.travel_candidate`, `expected_signals.risk_candidate`, and `expected_signals.life_event_candidate` are enforced in both directions when predictions are supplied. A `false` value asserts the signal must not be flagged, catching false-positive classifications.

New integration partners should map into these profiles or add new profiles to `multirail-profile-taxonomy.json` before adding golden expectations.

To compare actual model/API output against the golden set, provide a JSON file containing either an array or `{ "predictions": [...] }` with `transaction_id`, `clean_merchant_name`, `lifestyle_category`, `merchant_category`, `confidence_score`, and `signals.{travel_candidate, risk_candidate, life_event_candidate}` (or those signal keys at the top level of each prediction).

```sh
VENTUS_QA_PREDICTIONS_PATH=/path/to/predictions.json npm run --prefix backend qa:golden
```

For model comparison and partner-data readiness reviews, generate a report instead of only pass/fail output:

```sh
VENTUS_QA_PREDICTIONS_PATH=/path/to/predictions.json \
VENTUS_QA_MODEL_PROVIDER=gemini \
VENTUS_QA_MODEL_NAME=gemini-2.5-flash-lite \
VENTUS_QA_EVALUATION_REPORT_PATH=/path/to/model-output-report.json \
npm run --prefix backend qa:model-output
```

The report includes overall pass rate, missing and extra predictions, field-level accuracy, and breakdowns by source system, rail, source profile, and transaction type. This is the intended evaluation layer for comparing Gemini, OpenAI, Anthropic, or future partner-specific enrichment models before any production routing change.

For Plaid sandbox-specific reviews, generate a draft 50-transaction candidate set from a sandbox artifact directory:

```sh
PLAID_SANDBOX_ARTIFACT_DIR=/path/to/backend/artifacts/plaid-sandbox/20260608012241 \
PLAID_GOLDEN_TARGET_COUNT=50 \
npm run --prefix backend plaid:golden:candidates
```

This writes a local, git-ignored `plaid-golden-candidates.json` file with heuristic draft labels. These labels are not golden truth until reviewed and frozen by a human. Once enriched predictions are available for the same transaction IDs, compare them with:

```sh
VENTUS_QA_EXPECTATIONS_PATH=/path/to/plaid-golden-candidates.json \
VENTUS_QA_PREDICTIONS_PATH=/path/to/enrichment-predictions.json \
VENTUS_QA_EVALUATION_REPORT_PATH=/path/to/plaid-model-output-report.json \
npm run --prefix backend qa:model-output
```

To run the selected Plaid candidates through Ventus enrichment, first build the exact `POST /v1/enrich` fixture:

```sh
PLAID_GOLDEN_EXPECTATIONS_PATH=/path/to/plaid-golden-candidates.json \
PLAID_GOLDEN_NORMALIZED_PATH=/path/to/normalized-transactions.json \
npm run --prefix backend plaid:golden:fixture
```

Then submit/capture predictions against staging:

```sh
VENTUS_STAGING_API_BASE_URL=https://staging-api.example.com \
VENTUS_API_KEY=... \
PLAID_GOLDEN_ENRICH_FIXTURE_PATH=/path/to/plaid-golden-enrich-fixture.json \
npm run --prefix backend plaid:enrichment:capture
```

The capture script writes `enrichment-predictions.json` and raw API output alongside the fixture. It refuses to submit to `https://api.ventusai.com` unless `VENTUS_LIVE_QA_ALLOW_PRODUCTION=true` is set.

## Plaid Sandbox Pulls

Use `npm run --prefix backend plaid:sandbox:pull` to create Sandbox Items and save raw `/transactions/sync` responses into `backend/artifacts/plaid-sandbox/`. The artifacts directory is git-ignored because the raw pulls are operational QA output and may contain Sandbox access metadata.

Minimal smoke run:

```sh
PLAID_SANDBOX_USER_COUNT=5 npm run --prefix backend plaid:sandbox:pull
```

For bulk testing, create a local manifest outside committed fixtures and point the script at it:

```json
{
  "run_id": "plaid_bulk_qa_001",
  "institution_id": "ins_109508",
  "products": ["transactions"],
  "transactions": {
    "start_date": "2026-02-01",
    "end_date": "2026-06-05"
  },
  "users": [
    {
      "customer_id": "qa_plaid_card_001",
      "username": "user_good",
      "password": "pass_good"
    }
  ]
}
```

```sh
PLAID_SANDBOX_USERS_PATH=/path/to/plaid-sandbox-users.json npm run --prefix backend plaid:sandbox:pull
```

The first recommended cohort is 25 Sandbox users: 5 everyday card, 5 travel/lifestyle, 5 payroll/ACH, 5 P2P/wire/unusual rail, and 5 malformed or ambiguous cases. Use the output as raw evidence for normalization and reject-report QA before promoting anything into golden expectations.

## How This Helps Pilot Readiness

The first layer catches contract drift before code is promoted to staging or production. The next layer should reuse these validators against a staging API with a staging API key and known QA customer IDs, then add latency and stage-completion assertions for the full enrichment lifecycle.
