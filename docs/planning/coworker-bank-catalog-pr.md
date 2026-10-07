# PR: Carry the full bank catalog and size the digest to the book

Open at: https://github.com/VentusCard/ventus-ai/pull/new/zoheb/coworker-context-timing-console

## Summary

- The coworker catalog goes from 13 products to the bank's 55, each with the bank's own targets, qualifiers and blocks plus the eleven blocks every product shares (`aml_review`, `fraud_watch`, `prior_chargeoff`, `already_holds_product`, `marketing_opt_out`, `bankruptcy_active`, `hardship_program`, `financial_vulnerability`, `open_complaint`, `outreach_fatigue`, `estate_settlement`). Households carry the signals those products fire on, each with evidence. 49 of 55 products can fire on the 28-household book.
- The digest is 10–12 rows rather than a fixed length. Rows past the floor are only added when they bring a product and a headline the page has not used. Caps and the relaxation loop are sized to the floor. A household gets its row from its best product *that passes the quality gate*, not its best product outright.
- Replies go through the tool-calling agent (`COWORKER_AGENT=true`), which answers what was asked rather than the nearest task; the classifier still runs if the agent declines a turn. Plural and possessive family names ("the Lindqvists", "Lindqvist's") resolve.
- Cards with an unknown baseline headline after our own fee. Refinance pricing reads the balance and rate fields the catalog names, so auto refinance prices auto loans.
- Life-event reservation scales with mail length (`max(2, ceil(rows/4))`); `marriage` and `job_change` weighted.
- CDK: `COWORKER_DIGEST_MAX_ITEMS=12`, `COWORKER_DIGEST_MIN_ITEMS=10`, default cadence 2 days between touches / 0 between same product (the pacing formula takes the larger of the two; 5/5 paced the 28-household book to six rows).

## Model / tools used

Claude (Cursor agent) for implementation. No GLM. All code paths deterministic except the reply prose, which comes from the model named in `backend/config/model-routing.json` (`coworker_agent`: gemini-2.5-flash).

## Files changed

- `backend/shared/coworker/fixtures/product-catalog.json` (v5, 55 products), `fixtures/signals.json`
- `backend/shared/coworker/tasks.mjs`, `benefit.mjs`, `labels.mjs`, `render.mjs`, `core.mjs`, `agent.mjs` (new)
- `backend/functions/ventus-coworker-inbound/index.mjs` (agent flag), `ventus-coworker-digest` reads `COWORKER_DIGEST_MIN_ITEMS` (already in the packaged handler; source change in the digest function is in this branch's earlier commits)
- `backend/config/model-routing.json` (`coworker_agent` route), `backend/package.json` (`coworker:compare` script), `backend/scripts/compare-coworker-paths.mjs`
- `infra/lib/ventus-coworker-stack.ts`
- Tests: `tasks.test.mjs`, `benefit.test.mjs`, `portfolio-provider.test.mjs`, `render.test.mjs`, `core.test.mjs`, `agent.test.mjs` (new)
- Docs: `docs/planning/coworker-product-signal-map.md`, `life-event-product-map.md`, `coworker-unsubscribe-pr.md`

## Tests run

- `npm run --prefix backend test` — 452 passing, 0 failing.
- New guards mutation-tested: floor/ceiling (fails when the freshness check or floor-sized relaxation is removed), plural resolution, best-passing-alternative, category cap, reservation scaling, already-holds block, refinance fields, after-fee headline.
- `qa:enrichment` / `qa:model-output` not run: they exercise the enrichment pipeline, which this PR does not touch.
- Live: deployed to `VentusCoworkerStack` (us-east-1) 2026-10-07 01:23 and 01:37 UTC; deployed package verified to contain catalog v5. One digest sent to `zoheb@ventuscard.com` (12 rows, 11 products, 12 headlines) and six replies exercised on both the classifier and agent paths.

## Scope boundaries

- Fixture data only. No real household data, no Plaid.
- No IAM, networking, table, SES or secret changes. Lambda code, env and the inbound timeout (60s → 300s) only.
- Enrichment pipeline, API contracts and UI untouched.

## Known risks

- The mail lands at 12 on every fixture book; the floor only binds on thinner books. "10 guaranteed, usually 12" is the honest framing.
- Agent path: three live replies checked, not thirty. Every reply closes with the same "Want me to prep you for a call with X?" template.
- Six products are one signal away from firing (Flat-Rate Cash Back, Balance Transfer, Co-Brand, HSA, Motorcycle Loan, ABLE).
- Villanueva's 529 headlines "Expecting a child" rather than "Child heading to college" (fixture event order).
- `cdk deploy` without the demo context flags deploys a stack that does not send and admits no senders. Flags: `-c coworkerRegion=us-east-1 -c coworkerEmailDomain=demo.ventusai.com -c coworkerMailbox=coworker -c coworkerFrom=coworker@ventusai.com -c coworkerDryRun=false -c coworkerDemoOpen=true -c coworkerCadenceDays=2 -c coworkerSameProductDays=0 -c coworkerRateLimit=60 -c coworkerAgent=true`.
- Lambda zips in `backend/dist/lambda` are not rebuilt by `cdk deploy`; run `npm run --prefix backend package:functions` first or a stale build ships (this happened once tonight and was caught).
