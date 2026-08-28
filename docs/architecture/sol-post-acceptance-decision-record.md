# Sol Post-Acceptance Decision Record

Status: final architecture decision for the next implementation cycle

Date: 2026-08-01

Authority: `docs/architecture/enterprise-product-blueprint.md`

Evidence reviewed:

- `docs/evidence/staging-acceptance-2026-08-01.json`
- `docs/runbooks/dev-test-role-matrix.md`
- `docs/environment-promotion.md`
- `docs/product-goal-evidence-matrix.md`
- `docs/outcome-measurement-methodology.md`
- `docs/growth-play-onboarding-contract.md`
- `docs/decision-package-integration.md`

## Decision summary

1. **Canonical bank-review release.** The bank-inspectable release environment
   is the logical **bank-review staging release**: the canonical `staging`
   frontend, protected staging Console API and data stacks, staging identity,
   and sandbox connectors bound by one release-evidence manifest. A URL or Git
   branch alone is not a release.
2. **Current dev/staging composition.** The verified `dev` frontend calling the
   staging Console API is one intentionally wired non-production system. It is
   not evidence of disconnected products. Its open defect is release
   traceability: the existing evidence does not bind the deployed frontend job,
   frontend commit, public configuration, API deployment, database state, and
   role walkthrough into one immutable manifest. Existing evidence remains
   valid for its stated component and time, but this composition is not the
   canonical bank-review release until it is promoted and reconciled as one
   staging release.
3. **Two outcome paths.** Salesforce/FSC returns treatment workflow evidence.
   An authoritative bank-owned economic source returns the registered primary
   outcome for both treatment and holdout. The two paths join through Ventus
   assignment and Decision Package lineage; they are not interchangeable.
4. **Paid pilot.** The offer has two paid phases: paid readiness and integration,
   followed by a paid sanctioned pilot. Commercial discovery starts with
   onboarding Gate 5, outcome-return feasibility, before customization. This
   changes work order, not control order: no assignment or activation occurs
   until all six onboarding gates and four-eyes approvals pass.
5. **Account posture.** Bank of America remains the strategic founding and
   anchor partner. Ventus may run the same bounded proof with a faster
   institution in parallel. Neither account receives a product fork, shared
   tenant evidence, relaxed controls, or portable claims from the other.
6. **AI/Skill posture.** Employee brief generation is the first and only
   model-assisted promotion candidate in the next cycle. Intervention ranking
   is the shadow-only moat track. Moment qualification, eligibility, policy,
   assignment, action validation, delivery, measurement, and claims remain
   deterministic.
7. **Two product layers.** The everyday product remains Today to Moment to
   employee decision to native workflow to Results. The bank-review export is
   the approval product for risk, procurement, audit, and model governance. It
   packages and proves the operating product; it does not replace it.
8. **Scope.** Preserve the existing architecture, six roles, server-side role
   and scope enforcement, tenant isolation and forced RLS, four-eyes approvals,
   evidence taxonomy, Decision Package v1.2, and working integrations. Add no
   product destination, onboarding product, commercial lifecycle state, or
   institution-specific UI.

## 1. Bank-review release contract

### Canonical environment

`bank-review staging` resolves to all of the following as one release unit:

- Amplify app `d1gaewa028qzng`, `staging` branch, staging URL;
- protected staging Console API and Evidence Store stacks;
- staging Cognito and Aurora membership projection;
- Plaid and Salesforce/FSC sandbox or other explicitly approved
  non-production connectors;
- one reviewed repository revision per deployed component, with differences
  declared rather than assumed away;
- one immutable release-evidence manifest and independent review receipt.

The current `dev` frontend/staging API route may continue as a shared
integration topology. It cannot be labeled the bank-review release merely
because each leg works. Promotion does not require a source-code redesign; it
requires traceable deployment and configuration evidence.

### Release-evidence manifest

The manifest is an immutable JSON artifact. It contains no secret values,
tokens, customer data, or passwords. At minimum it binds:

| Section | Required fields |
| --- | --- |
| Release identity | Manifest version, release ID, environment class, created time, repository, reviewer state |
| Frontend | URL, Amplify app/branch/job, deployed commit, build artifact digest, build result, observed time |
| API | Base URL/stage, account/region, stack, deploy run, deployed commit, Lambda or artifact digests, observed time |
| Public configuration | API and identity target identifiers or value digests, enabled non-secret flags, CORS origin set, configuration digest |
| Identity and authorization | User-pool/client identifiers or digests, membership/schema version, six-role test receipt, denied-operation receipt |
| Data plane | Stack and migration digests, schema inventory, runtime role, forced-RLS/non-bypass result, ledger head and verification |
| Integrations | Environment and mapping version for each enabled connector, credential metadata reference only, health/delivery/reconciliation receipt IDs |
| Product contract | Decision Package version/digest, approved protocol IDs/digests, active deterministic version, Skill IDs/versions/states |
| Acceptance | Acceptance-matrix row, result, artifact URI/digest, actor or reviewer, timestamp |
| Claims | Evidence class, measurement status, claim status, prohibited wording, known limitations |
| Exceptions | Every component mismatch, expiry, pending reconciliation, and external dependency with owner |
| Approval | Release owner and independent reviewer receipts bound to the manifest digest |

A manifest fails closed as `not_bank_review_ready` when a deployed component,
configuration target, required receipt, digest, or independent approval is
unknown or inconsistent. A declared dev/staging component mismatch is an
exception, not proof of disconnection and not a passing bank-review state.

## 2. Outcome evidence paths

### Path A: treatment workflow evidence

Salesforce/FSC receives the approved treatment Decision Package projection and
may return:

- external record and task identifiers;
- assignment or owner routing;
- accepted, modified, deferred, declined, or completed state;
- event time, response time, reason code, and reconciliation status.

This path is treatment-only because holdout subjects receive no Ventus action
and no FSC treatment record. FSC observations are operating evidence. They may
explain adoption, capacity, execution, and noncompliance, but do not supply the
primary P&L metric and do not unlock a business or causal claim.

### Path B: authoritative economic outcome

The institution's ledger, books-and-records system, or certified outcome view
returns the registered outcome envelope for every assigned treatment and
holdout subject. Both arms use the same source, metric definition, source
version, cadence, window, freshness, explicit-zero rule, and correction policy.
The bank feed does not author tenant, arm, protocol, decision, activation, or
claim state; Ventus derives those from persisted records.

Results remain coverage-incomplete when one arm is missing, delayed, or
selectively returned. Workflow completion is never substituted for a missing
economic observation. Corrections append; they do not rewrite history.

## 3. Two-phase paid pilot

### Phase A: paid readiness and integration

Purpose: determine whether the institution can run a measurable, governed
pilot before Ventus or the bank commits to custom mapping work.

Work starts with a **Gate 5 feasibility preflight**: name the metric owner,
authoritative source, treatment/holdout population, subject linkage, explicit
zero, correction semantics, return cadence, outcome window, and analysis owner.
If the bank cannot provide a credible two-arm outcome path, the pilot stops or
is re-scoped before workflow customization.

After feasibility is established, the parties complete Gates 1 through 5 and
prepare Gate 6 shadow proof. Phase A may use fixtures and partner sandboxes.
Its claims ceiling is mechanism, control operation, integration feasibility,
and observed sandbox workflow behavior. It cannot claim bank value, lift,
causality, production readiness, or BofA endorsement.

Phase A exits only with the first five gate artifacts, a draft immutable Growth
Play protocol, a mutual dependency register, and a signed Phase B go/no-go.

### Phase B: paid sanctioned pilot

Purpose: operate one bounded non-production tenant, business line, Growth Play,
sanctioned source, employee destination, and authoritative outcome return.

Phase B begins only after all six gates, environment acceptance, four-eyes
protocol approval, assignment design, capacity, stop conditions, and analysis
freeze pass. It produces treatment workflow receipts, protected holdout
evidence, two-arm economic outcomes, coverage and integrity results, and an
independent claim decision.

Its default claims ceiling is descriptive, internal, and limited to the
registered institution, population, metric, protocol version, and completed
window. `review-ready` does not mean approved. Causal or external language is
allowed only through an append-only approval naming the exact method, wording,
audience, and limitations. Payment does not guarantee positive lift or a claim.

### Mutual obligations

Ventus must:

- provide the bounded environment, contracts, mapping templates, tests,
  receipts, evidence bundle, support path, and truthful claim controls;
- preserve tenant, role, four-eyes, holdout, secret, and evidence boundaries;
- disclose defects, ambiguous connector states, model changes, and evidence
  limitations promptly;
- stop or pause in accordance with the approved control record.

The institution must:

- name accountable business, risk/model, identity, data, workflow,
  measurement, security, and legal/procurement owners;
- provide timely approvals, SSO/role mappings, allowlisted sanctioned evidence,
  sandbox workflow access, customer-token linkage, and an authoritative
  treatment-and-holdout outcome return;
- approve the metric, population, holdout, policy, action catalog, capacity,
  window, correction rules, analysis plan, claims, and employee process;
- disclose source or policy changes, preserve assignment integrity, and avoid
  selective outcome return or off-protocol treatment of holdout.

Dependencies have an owner, due date, evidence artifact, and stop/extend
effect. A delayed bank dependency pauses the affected evidence clock; Ventus
does not manufacture missing evidence or silently weaken a gate.

### Numerical decision

The following are calibration proposals until pre-registered and approved for
the institution: holdout percentage, minimum sample and power assumptions,
outcome coverage, outcome window, source freshness, employee response target,
service window, capacity, contamination and attrition limits, confidence or
uncertainty method, model quality delta, shadow volume/duration, runtime, and
cost budget. Existing values such as 30 observations per arm, 90 percent
coverage, 70 percent response, 95 percent benchmark acceptance, two percentage
points of improvement, three repeated runs, 500 cases/30 days, USD 0.02, and
five seconds are sandbox or planning defaults only.

The following remain hard controls, not calibration proposals: schema-valid
contracts; zero tenant, authorization, consent, policy, holdout, secret, and
business-line violations; no fabricated evidence; no action outside the
approved catalog; immutable assignment and approvals; append-only corrections;
fail-closed behavior; and exact evidence/claim labeling.

## 4. Account strategy

BofA remains the strategic founding and anchor partner for enterprise control
requirements, Consumer Deposit Primacy, Merrill reuse, and long-horizon account
design. Unverified BofA systems and policies remain configuration and discovery
items.

A faster proof institution may proceed in parallel when it accepts the same
bounded pilot, outcome, security, and claims contract. The proof institution is
not a lower-control shortcut. Its purpose is to shorten evidence latency and
test institutional portability.

Guardrails:

- one core product, Decision Package v1.2, evidence taxonomy, and acceptance
  standard;
- separate tenants, credentials, manifests, reviewers, and claims;
- configuration and thin adapters only; no institution-specific UI fork;
- no transfer of data, approvals, results, endorsement, or claim authority;
- learning may improve templates and tests, but a material contract change
  requires Sol review and a new protocol or Skill version as applicable.

## 5. AI and Skill strategy

### Promotion candidate: employee brief

The first candidate is a post-decision employee brief generated only from the
approved, bounded Decision Package projection. It may compress and order
already approved evidence and explain the already selected action. It cannot
qualify the moment, rank actions, add evidence, alter policy language, expose
holdout, deliver an action, or change the canonical package.

Promotion remains Skill-version- and Growth-Play-specific. The deterministic
brief remains the fallback. The candidate must produce typed output, cite only
provided evidence identifiers, preserve required limitations, pass frozen
offline and sanctioned-shadow review, and obtain separate business,
risk/model, and environment approvals. Numerical performance, latency, and
cost thresholds remain registered calibration values; critical grounding,
policy, privacy, and scope failures have a zero-tolerance gate.

### Shadow-only moat: intervention ranking

Intervention ranking continues against the closed approved action catalog in
shadow. Its predictions and counterfactual comparisons are retained for
evaluation and learning, but they cannot change moment qualification, the
active recommendation, assignment, operator presentation, or delivery in the
next cycle. Model-assisted moment qualification is out of scope; the existing
deterministic qualification path remains authoritative.

## 6. Exact next-cycle acceptance matrix

`Required for Fable` means direct evidence from the manifest-bound bank-review
staging release unless the row explicitly names an external pilot artifact.

| ID | Control | Exact acceptance | Current disposition | Package |
| --- | --- | --- | --- | --- |
| A1 | Release identity | One passing manifest binds staging frontend, API, identity, data, integrations, commits, configuration, evidence and two reviewers | Open: component evidence exists; unified manifest does not | Terra T3 / Luna M1 |
| A2 | Six-role projection | All canonical roles pass start-route, field, scope and denied-operation checks on the manifest release | Provisionally passed on dev UI; rerun must be release-bound | Luna M1 |
| A3 | Tenant and four-eyes | Cross-tenant/line/queue probes return zero; forced-RLS role is non-bypass; configurator cannot approve own immutable protocol | Backend evidence passed at recorded staging revision; rerun must be release-bound | Luna M1 |
| A4 | Treatment workflow | One authorized operator creates one FSC sandbox treatment record; response, reservation, delivery and reconciliation receipts share tenant, subject, protocol and Decision Package digest; replay creates no duplicate | Partial: treatment workflow verified; FSC outcome reconciliation is pending | Terra T1 / Luna M2 |
| A5 | Holdout integrity | Assignment precedes decisioning; holdout creates no Moment, employee brief, action capability or FSC treatment record | Provisionally passed in dev walkthrough; manifest-bound negative trace required | Luna M2 |
| A6 | Two-arm outcome | Registered authoritative source accepts append-only treatment and holdout observations under one source/version/window and derives arm/lineage server-side | External bank-owned source and completed return are open | Terra T2 / Luna M2 |
| A7 | Measurement and claims | Missing-arm or parity failure blocks results; permitted claim equals evidence class, measurement state and append-only claim approval | Sandbox claim boundary passed; sanctioned result remains external | Terra T2 / Luna M2 |
| A8 | Decision Package v1.2 | Same package digest and bounded fields reconcile across Ventus, FSC and enabled brief projection; mutable receipts remain separate | Contract exists; one release-bound cross-surface reconciliation is open | Luna M2 |
| A9 | Pilot gates | Gate 5 feasibility artifact exists before custom integration; Gates 1-6 and three independent go/no-go decisions exist before assignment | External institution artifacts open | Luna M3 |
| A10 | Mutual obligations | Signed scope names both parties' artifacts, owners, dates, stop/extend effects, claims ceiling and change control | Open commercial dependency | Luna M3 |
| A11 | Employee brief Skill | Frozen task-specific benchmark and shadow receipts show typed, evidence-bound, post-decision behavior; three approval types bind one digest before promotion; deterministic fallback passes | Candidate not yet accepted | Parallel founder/reviewer work / Luna M4 |
| A12 | Ranking moat boundary | Intervention ranking is shadow-only and cannot affect qualification, active recommendation, assignment, UI action or delivery | Shadow-only implementation exists; influence tests and release receipts remain open | Existing shadow track / Luna M4 |
| A13 | Institutional portability | Any proof institution uses configuration/thin adapters with a separate tenant and manifest; no core fork or evidence transfer | External account selection and exercise open | Luna M3 |

Any failure in A1, A3, A5, A7, A8, A11 hard controls, or A12 influence
is a rejection. Missing external artifacts in A6, A9, A10, or A13 keep the
decision at conditional sandbox acceptance; they do not erase verified
mechanism evidence.

## 7. Terra High implementation packages

Terra executes T1 through T4 in order. Each package is a separate pull request,
changes only the named files unless Sol approves an amendment, and completes
before Luna edits its corresponding evidence or runbook.

### T1: FSC treatment-workflow reconciliation

Goal: return the operator's FSC response/completion into the durable workflow
ledger and Results without representing it as an economic outcome.

File boundary:

- `backend/shared/console-api.mjs` and its FSC reconciliation tests;
- `backend/shared/enterprise-control-plane.mjs` and its FSC observation tests;
- `backend/functions/ventus-console-api/index.mjs` and its tests;
- `infra/lib/ventus-console-api-stack.ts`, limited to the existing-role
  EventBridge trigger for the IAM-authenticated internal route;
- no outcome-measurement, SQL, frontend, new IAM role/trust, or product-surface
  files.

Approved amendment A1 (2026-08-02): the trigger is an EventBridge event-pattern
entry point for `ventus.console` / `fsc_outcome_reconciliation_requested`.
It passes only the event's tenant and decision identifiers to the existing
`/internal/outcomes/salesforce-sync` route, is constrained to the tenants
already listed in `VENTUS_OUTCOME_RECONCILIATION_TENANTS`, and assumes the
existing `ventus-fsc-outcome-reconciler` role. It must not add a schedule,
broaden role trust or API authorization, read another tenant, or create a new
user-facing surface. The event producer remains an external/runtime dependency
until its permissioned release path is separately evidenced.

Acceptance:

- one FSC treatment record returns response, completion, timing, reason,
  external IDs, and reconciliation state;
- one immutable workflow observation and ledger receipt share the tenant,
  subject, decision, protocol, mapping version, and Decision Package v1.2
  digest;
- retry is idempotent and ambiguous state remains pending;
- Results projects the workflow receipt but no P&L value or lift eligibility;
- holdout has no FSC record or reconciliation requirement.

### T2: Authoritative two-arm rehearsal

Goal: run a deterministic non-production rehearsal through the authoritative
outcome adapter for treatment and holdout.

File boundary:

- `backend/scripts/rehearse-authoritative-outcomes.mjs` and its test fixtures;
- `backend/shared/authoritative-outcome-adapter.mjs` and test only if the
  rehearsal exposes a contract defect;
- `backend/shared/experiment-measurement.mjs` and test only if the rehearsal
  exposes a calculation-state defect;
- `backend/shared/sandbox-evidence-bundle.mjs` and test only to export the
  existing evidence records;
- no T1, frontend, infra, authorization, or documentation files.

Acceptance:

- both arms contain an explicit zero observation and at least one non-zero
  observation under the same source, version, metric, and window;
- one later correction appends with a higher sequence and the earlier record
  remains inspectable;
- arm, tenant, experiment, decision, and protocol are derived server-side;
- sample and coverage states update from the persisted evidence;
- evidence remains fixture or partner sandbox, and business/causal lift claims
  remain false even if a numerical difference is calculable;
- the exported rehearsal bundle contains assignments, observations,
  corrections, ledger receipts, coverage, state, and claim boundary.

### T3: Manifest-bound staging promotion

Goal: bind and promote one exact reviewed commit to the canonical staging
frontend and backend.

File boundary:

- `backend/scripts/release-evidence-manifest.mjs` and its test;
- `docs/evidence/release-manifest.schema.json` and generated manifest only;
- `.github/workflows/infra-staging.yml` only for collection and validation;
- `package.json` only for a validation command;
- no runtime, UI, authorization, or product-contract files.

Acceptance:

- one secret-free manifest contains every Section 1 field;
- one Git commit links the staging Amplify job, Console API deployment,
  migration digests, identity target, connector mappings, evidence bundle, and
  claims boundary;
- an unknown or mismatched component fails `bank_review_ready`;
- the exact reviewed commit is promoted under the existing protected release
  authority; Terra does not merge or expand deployment authority;
- the canonical staging URLs return the manifest-bound release.

### T4: Isolated backup/restore proof

Goal: prove that the staging evidence data can be restored into an isolated,
non-serving target without mutating the source.

File boundary:

- `infra/scripts/verify-evidence-backup-restore.mjs` and its local validator
  test;
- `docs/evidence/` for the generated dated restore receipt only;
- no application runtime, database migration, IAM, network, authorization, UI,
  or product documentation files.

Acceptance:

- source identifiers are resolved read-only and the restore target is a new,
  explicitly isolated staging verification resource;
- source snapshot time, restore start/end, observed RPO, observed RTO, target
  identifier, migration inventory, tenant/RLS probe, ledger head/hash result,
  and cleanup disposition are recorded without secret values;
- source data and serving endpoints are unchanged;
- restore verification fails closed on migration, RLS, tenant, or ledger
  mismatch;
- cleanup follows the approved infrastructure-owner procedure and the receipt
  states whether the isolated target remains or was removed.

## 8. Luna Medium verification packages

Luna may add test evidence and concise defect fixes inside a Terra package's
file boundary. It must not change architecture, authorization, lifecycle,
claims, or product surfaces.

### M1: Release and access reconciliation

- independently recompute the H1 manifest digest;
- visit only the manifest URLs and verify displayed release identity;
- rerun six roles, denied routes, cross-scope probes, forced-RLS/non-bypass,
  ledger integrity, and four-eyes tests;
- return A1-A3 receipts and screenshots bound to the manifest.

### M2: Outcome and Decision Package verification

- execute one treatment, one holdout, suppression, abstention, retry,
  ambiguous-delivery, correction, explicit-zero, missing-arm, and
  mixed-version case;
- reconcile the treatment FSC record and both authoritative observations to
  assignment, protocol, and Decision Package v1.2 digest;
- verify claim status never exceeds evidence and that holdout never appears in
  an operator or destination surface;
- return A4-A8 evidence.

### M3: Pilot and account-contract verification

- review the Phase A/Phase B scope against the six gate artifacts and mutual
  obligation register;
- verify Gate 5 feasibility precedes custom integration spend while all six
  control gates still precede assignment;
- verify calibration proposals are labeled and hard controls are not
  negotiable;
- for any named proof institution, inspect tenant, configuration, manifest,
  adapter, and claims isolation;
- return A9, A10, and A13 evidence or name the external owner and dependency.

### M4: Skill boundary verification

- independently score the frozen employee-brief benchmark and critical slices;
- probe fabricated citations, prohibited data, instruction injection, missing
  evidence, policy wording, holdout leakage, model failure, and fallback;
- prove by trace comparison that intervention ranking cannot alter
  qualification, active recommendation, operator action, assignment, or
  delivery;
- verify approval subjects, digests, revisions, pause behavior, and receipts;
- return A11-A12 evidence.

## 9. Explicit non-goals

- No implementation, deployment, merge, authorization change, or account
  provisioning in this Sol pass.
- No seventh destination, pilot dashboard, deal room, onboarding product, or
  commercial workflow state.
- No BofA-only or proof-bank-only product fork.
- No cross-business data dependency or connected-play requirement for MVP.
- No model-assisted moment qualification in the next cycle.
- No model control over policy, eligibility, assignment, action validity,
  connector authorization, measurement, or claims.
- No raw transaction lake, customer master, CRM replacement, or bank
  accounting reconstruction.
- No production or causal claim from fixture, sandbox, workflow completion, or
  an unreviewed treatment/holdout difference.
- No universal numeric pilot or model threshold inferred from current defaults.

## 10. Unresolved external dependencies

- A bank-approved economic metric owner, authoritative source, two-arm return
  contract, correction policy, and analysis owner.
- Institution SSO/group mapping, access review, retention, privacy, legal,
  security, model-risk, procurement, incident, and support decisions.
- Bank-approved evidence schema, token linkage, action catalog, employee
  workflow mapping, capacity, service window, holdout, and contamination plan.
- A completed FSC treatment reconciliation for the bank-review release.
- BofA confirmation of employee systems, workflow authority, outcome sources,
  and pilot sponsorship.
- Selection and authorization of any parallel proof institution.
- Institution reviewers and adjudicated sanctioned data for employee-brief
  shadow evaluation.

## 11. Evidence required before the next Fable review

The Fable packet is complete only when it contains:

1. one passing bank-review staging release manifest and independent digest
   verification;
2. manifest-bound six-role, denial, tenant/RLS, ledger, secret-boundary, and
   four-eyes receipts;
3. one treatment FSC delivery and reconciliation receipt plus one negative
   holdout destination trace;
4. authoritative outcome contract validation for both arms, including
   explicit zero, correction, missing-arm, parity, freshness, and mixed-version
   cases;
5. Decision Package v1.2 cross-surface digest reconciliation;
6. Results screenshots and underlying records showing evidence class,
   measurement status, claim status, sample, coverage, and limitations;
7. Phase A/Phase B pilot scope, Gate 5 feasibility artifact, gate artifact
   index, mutual obligations, stop conditions, and calibration register;
8. BofA anchor plan and, if selected, a separately scoped proof-institution
   charter with no fork or evidence transfer;
9. employee-brief frozen benchmark, deterministic baseline, shadow evaluation,
   critical-slice results, cost/latency record, fallback trace, and approval
   state;
10. intervention-ranking non-influence traces;
11. Luna's A1-A13 matrix with artifact links, digests, timestamps, reviewers,
    open external owners, and an explicit recommendation: rejected,
    conditionally accepted for sandbox, or accepted for sanctioned pilot.

Fable review does not require positive lift, production deployment, BofA
production integration, a completed outcome window, or a promoted Skill. It
does require every absence to be explicit and every claim to stay below its
evidence ceiling.
