# Ventus × Bank of America — pilot architecture and evidence map

This page separates what leadership sees in the founding-partner demo from what Ventus
must evaluate internally before any capability advances into a bank pilot.

## One product, two audiences

`/bankdemo` is the BofA-facing product narrative. It shows four platform promises from
the shared registry in `src/lib/capabilities.ts`: financial-state intelligence, governed
decisioning, existing-channel activation, and incremental measurement. It does not expose
model benchmarking, Skill promotion, or the prototype ledger.

`/internal/capabilities` is an unlinked, presentation-gated evaluation register. The same
registry states the current implementation truth and the evidence required to advance
each capability. Evaluation-locked capabilities remain disabled until the sponsor approves
the pilot and its evidence plan.

## What exists now

- `src/lib/pipeline.ts` exercises the intended ingest → enrich → score → gate contract with
  authored synthetic inputs. It proves deterministic UI and payload behavior, not model accuracy.
- `src/lib/skills.ts` represents a reusable decision package with objective, P&L metric,
  trigger, cohort, evidence, policy, delivery, and holdout. Seed Skills remain drafts until
  approval, sample, precision, fairness, holdout, and lift gates are satisfied.
- `src/lib/ledger.ts` provides a local in-memory checksum chain and stable event idempotency
  keys. It is an evaluation aid, not a production audit store.
- `src/lib/integrations.ts` and `api/deliver.ts` define staged payload contracts for existing
  bank channels. Bank sandbox authentication and authorization remain pilot work.

## Runtime model boundary

The BofA demo does not call OpenRouter or compile Skills through an external model. Existing
model benchmarks are evaluation assets only. Runtime model use requires sponsor approval,
provider/data-boundary review, structured-output validation, and proof that it beats the
deterministic baseline on quality and cost.

### Environment gates

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_ENABLE_INTERNAL_EVAL=true` | Client build | Unlocks `/internal/growth-desk`, simulated-evidence lifecycle testing, and internal evaluation controls. |
| `ENABLE_INTERNAL_MODEL_EVAL=true` | Server runtime | Allows the four model-evaluation endpoints to run; otherwise they return `404`. |
| `DELIVERY_WEBHOOK_URL` | Server runtime | Optional approved sandbox destination for staged delivery payloads. No value means payload preview only. |
| `VITE_REHEARSAL_URL` | Client build | Optional receiver for the Prove step's connected rehearsal and the Live Lab's delivery. When set, real network writes are performed and receiver receipt ids are shown; unset, it is simulated and nothing leaves the browser. |
| `ENABLE_LIVE_CONNECTORS=true` | Server runtime | Enables credentialed Plaid, Salesforce, and generic delivery endpoints. They return `404` by default. |
| `VENTUS_CONNECTOR_TOKEN` | Server runtime | Legacy compatibility bearer used when signed sessions are not configured. Do not expose it through a `VITE_*` variable or browser bundle. |
| `VENTUS_CONNECTOR_SESSION_SECRET` | Server runtime | Enables short-lived signed connector sessions bound to tenant, subject, scope, and destination. Store only in the approved secret manager. |
| `VENTUS_ALLOW_LEGACY_CONNECTOR_TOKEN=true` | Temporary production rollback only | Keeps the static bearer usable after session auth is enabled. Remove after callers migrate. |
| `VENTUS_ALLOW_LOCAL_CONNECTORS=true` | Local server only | Allows the explicit `x-ventus-client` demo header outside Vercel production. Never use this setting for a public deployment. |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` | Server runtime | Enable `/api/plaid-transactions` (real Plaid sandbox ingestion). Unset → the API returns 503 and the Live Lab falls back to Plaid-schema fixtures; the pipeline logic is identical either way. |
| `PLAID_ENV` | Server runtime | Plaid environment for ingestion (`sandbox` default). |
| `SF_LOGIN_URL` / `SF_CLIENT_ID` / `SF_CLIENT_SECRET` | Server runtime | Enable `/api/salesforce-deliver` — a REAL Salesforce write (OAuth client-credentials → standard `Task` record; receipt = the record id + Lightning URL). Unset → documented 503 and the Live Lab falls back to the mock receiver. |
| `DATABASE_URL` / `VENTUS_DATABASE_URL` | Server / script runtime | Non-prod Postgres for the durable decision ledger, Growth Play approval registry, and institution access records. `npm run db:migrate` (as owner) applies the seven evidence and access migrations; `npm run db:verify` (as the NOSUPERUSER NOBYPASSRLS runtime role) appends a lineage and verifies the hash chain from DB rows. Unset → in-memory evidence. `PGSSL=disable` for local. |
| `ENABLE_GROWTH_PLAY_CONTROL_PLANE=true` | Server runtime | Enables the default-off Growth Play registration/approval endpoint. Does not weaken connector gates. |
| `VENTUS_CONTROL_PLANE_SESSION_SECRET` | Control-plane server | Signs short-lived tenant/role/business-line sessions. Must be distinct from connector signing credentials. |
| `VENTUS_CONTROL_PLANE_ISSUER_TOKEN` | Non-production issuer only | Allows `/api/control-plane-session` to mint evaluation sessions. Static issuance is always disabled in production. |
| `VENTUS_PROTOCOL_ADMIN_DATABASE_URL` | Control-plane server / setup script | Separate configuration credential used by the control-plane endpoint and `pilot:e2e`. The activation runtime receives registry `SELECT` only; never expose this credential to the browser or activation service. |
| `ENABLE_STANDALONE_PILOT_RUNTIME=true` | Activation server | Enables the default-off Consumer/Merrill standalone operating-loop endpoint. Production-assisted mode remains rejected. |
| `VENTUS_EXPERIMENT_ASSIGNMENT_SALT` | Activation server secret | Stable server-held salt for protocol-bound treatment/holdout assignment. Never accept it from a request or expose it to the browser. |
| `VENTUS_PILOT_DELIVERY_WEBHOOK_URL` / `VENTUS_PILOT_DELIVERY_BEARER` | Activation server | Approved HTTPS sandbox workflow receiver and server credential. Required for assisted runs; returned receipt IDs enter the durable evidence loop. |
| `VENTUS_SESSION_ISSUER_TOKEN` | Server runtime | Admin bearer that authorizes `/api/connector-session` to mint connector sessions in non-prod (replaced by SSO in production; production issuance requires `VENTUS_ALLOW_TOKEN_ISSUER=true`). |

The whole chain runs end to end with `npm run pilot:e2e` — see `docs/pilot/non-prod-pilot-e2e.md`.
It is green on fixtures and activates each live leg (Postgres ledger, session-authorized
Salesforce) as the variables above appear.

### Salesforce connector (real org, ~5 min setup)

1. Create a free Developer Edition org: developer.salesforce.com/signup.
2. Setup → App Manager → **New Connected App**: enable OAuth (scope: *Manage user data via APIs*),
   enable **Client Credentials Flow**, assign a run-as user.
3. Set `SF_LOGIN_URL=https://<yourdomain>.my.salesforce.com`, `SF_CLIENT_ID`, `SF_CLIENT_SECRET`,
   `ENABLE_LIVE_CONNECTORS=true`, and a strong `VENTUS_CONNECTOR_TOKEN`.
4. `npm run test:salesforce` — creates a real Task and reads it back (prints the Lightning URL).
   For a local Live Lab, also set `VENTUS_ALLOW_LOCAL_CONNECTORS=true`. A deployed browser
   requires server-side SSO/session authorization and must not receive the connector token.

Uses only standard Task fields, so an untouched dev org accepts the write — which is the point:
swapping the mock for the bank's sandbox is configuration, demonstrated rather than claimed.

For enterprise activation, use the session rollout in `docs/integrations/connector-session-rollout.md`. The
static bearer remains a compatibility path, not the target authorization model.

### Live Pipeline Lab (real connections, laptop-only)

`/internal/live-lab` is an evaluation-only surface behind the internal build flag and the
demo UI gate. It runs a deterministic pipeline — `src/lib/plaid.ts` (ingest → normalize →
detect → decide) and `src/lib/loop.ts` (outcome-weighted re-ranking) — on Plaid-schema data.
Plaid ingestion and delivery can use real sandbox connections; classification remains
transparent rule logic until model evaluation proves a replacement. Verify the logic without
keys via `npm run test:pipeline`. The client-side password screen is presentation gating, not
production authentication; internal routes reject the public demo's query-string navigation
shortcut.

```bash
# Fully live: real Plaid + connected delivery
PLAID_CLIENT_ID=... PLAID_SECRET=... PLAID_ENV=sandbox \
ENABLE_LIVE_CONNECTORS=true VENTUS_ALLOW_LOCAL_CONNECTORS=true \
VITE_ENABLE_INTERNAL_EVAL=true VITE_REHEARSAL_URL=http://localhost:8787/work-items npm run dev
node scripts/mock-cew-sandbox.mjs   # the delivery receiver, second terminal
```

### Quick real-life demo (laptop-only, no bank systems)

```bash
node scripts/mock-cew-sandbox.mjs                                # terminal 1 — the "bank sandbox"
ENABLE_LIVE_CONNECTORS=true VENTUS_ALLOW_LOCAL_CONNECTORS=true \
VITE_ENABLE_INTERNAL_EVAL=true VITE_REHEARSAL_URL=http://localhost:8787/work-items npm run dev  # terminal 2
```

Open `http://localhost:8787` on a second screen. When the presenter clicks **Run connected
rehearsal**, real payloads (tokenized, schema-true) cross the network and receipts appear on
both screens — the same route a bank sandbox would use, demonstrated live. Swapping the mock
for a real Salesforce/CEW sandbox endpoint is a URL change, which is exactly the claim.

The client and server evaluation flags are intentionally separate. Enabling the internal UI
does not authorize a model provider or credentialed connector call. A public deployment needs
bank-grade SSO/session authorization before the browser can invoke live connectors; the local
header exception is deliberately rejected in Vercel production.

## Pilot activation targets

| Destination | Intended bank surface | Pilot proof required |
| --- | --- | --- |
| Advisor / Merrill referral | CEW · Book 360 / Salesforce FSC | Sandbox write, identity mapping, idempotency |
| Banker outreach | Banker workbench | Work-item contract and authorization |
| Lifecycle nurture | Approved campaign platform | Consent, suppression, and journey entry contract |
| Digital insight | Erica or bank-owned digital channel | Eligibility and content approval |
| Measurement | Bank outcome feed | Holdout assigned before activation and completed outcome window |

## 90-day evidence sequence

1. **Calibrate:** sanctioned sample, golden labels, provenance, precision, and drift baseline.
2. **Shadow:** one approved use case; no customer-facing action; review policy and fairness exceptions.
3. **Assisted activation:** banker/advisor confirms the recommendation; write only to a sandbox or approved queue.
4. **Measure:** compare incremental P&L outcome against the pre-assigned holdout.
5. **Advance or stop:** promotion requires recorded approval, sufficient sample, ≥90% precision,
   completed fairness review, and positive incremental lift.

The founding pilot should prove one measurable outcome before Ventus expands across service
lines. BofA-specific adapters are configuration; the capability and evidence model remains
portable to other financial institutions.
