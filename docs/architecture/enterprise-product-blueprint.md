# Ventus AI Enterprise Product Blueprint

> **🧭 PLANNED / TARGET STATE (as of 2026-08).** A large target-state blueprint. It mixes the real enrichment backend with subsystems that were never built or since removed (Growth Play control plane, `growth-play-contract.mjs`, `growth-play-registry.sql`). Treat as a design proposal, not a description of what exists.

Status: implementation authority

Audience: product, engineering, design, security, pilot operations

Applies to: Growth Console, native-system integrations, Coworker, and the decision runtime

Initial vertical slice: Consumer Deposit Primacy

Reusable vertical slice: Merrill Qualified Wealth Growth

## 1. Decision

Ventus AI is a governed decision and action platform for financial institutions.
It converts approved evidence into a qualified customer moment, recommends one
bounded action, lets the accountable employee make the decision, delivers the
action into the institution's existing system of work, and measures the result.

Ventus is not:

- a replacement CRM, core banking system, campaign platform, or communication
  suite;
- a passive analytics dashboard;
- a general-purpose employee copilot;
- an autonomous agent that silently changes production policy;
- a store for unrestricted customer transaction data;
- a cross-business data-sharing promise.

The product must create standalone value inside one business line using the data
and workflows that business line already controls. Cross-business expansion is
an optional, separately permissioned Growth Play after each participating line
has proven value independently.

## 2. Product Contract

Every production decision must be expressible as this controlled loop:

```text
approved evidence
  -> qualified moment or abstention
  -> policy and eligibility decision
  -> treatment or holdout assignment
  -> one recommended action from an approved catalog
  -> accountable human response when required
  -> idempotent native-system delivery
  -> immutable delivery receipt
  -> registered outcome observation
  -> measured result when evidence gates pass
```

The console is the control and review plane. The AWS runtime is the canonical
decision and evidence plane. Salesforce, Outlook, Slack, and future bank
workbenches are execution and attention surfaces.

The everyday product journey is Today to Moment to employee decision to native
workflow to Results. The evidence bundle and bank-review export are the
approval product for risk, procurement, audit, and model governance. They prove
and package the operating journey; they do not replace it or create a separate
decision system.

The frontend may render and collect responses. It must not authoritatively
calculate eligibility, policy clearance, experiment assignment, or lift.

## 3. Evidence Boundary

Evidence origin, measurement maturity, and claim authority are separate axes.
No status on one axis may upgrade another.

Canonical evidence origins:

| `evidenceClass` | Display label | Meaning | Maximum claim from origin alone |
| --- | --- | --- | --- |
| `fixture` | Fixture | Ventus-authored synthetic or test records | Interaction and contract demonstration only |
| `partner_sandbox` | Partner sandbox | A live external sandbox call using synthetic or test records | Connector and mechanism demonstration |
| `sanctioned_pilot` | Sanctioned pilot | Institution-approved data and workflow under a signed scope | Operational evidence within that approved scope |

`measured` is not an evidence class. Measurement maturity is recorded
separately:

| `measurementStatus` | Display label | Meaning |
| --- | --- | --- |
| `not_started` | Not started | No registered outcomes for the analysis window |
| `collecting` | Collecting | Outcomes are arriving but the analysis window is open |
| `insufficient_sample` | Sample building | The pre-registered minimum sample has not been reached |
| `incomplete_coverage` | Coverage incomplete | Required outcome coverage or treatment/holdout parity has not been reached |
| `measured` | Measured | The registered method has run on an eligible, complete sample |

Claim authority is recorded independently:

| `claimStatus` | Display label | Permitted language |
| --- | --- | --- |
| `not_eligible` | Not eligible | Mechanism or operational facts only |
| `descriptive` | Descriptive | Observed counts, rates, and differences with method and limitations |
| `independent_review_required` | Review required | A pre-registered result exists but cannot be presented as an approved business or causal claim |
| `approved` | Approved claim | Only the language and scope named in an append-only reviewer approval receipt |

A result may be `measured` and still be `not_eligible` for a business claim.
Causal language additionally requires an approved experiment design and
analysis; neither a Salesforce completion nor a treatment/holdout difference
alone proves causality.

An evidence bundle preserves the class of every component. A bundle containing
a partner-sandbox delivery receipt and fixture outcomes is labeled **Mixed
evidence** in its manifest and inherits the lowest support required for the
claim being made. `mixed` is a presentation label, not a row-level
`evidenceClass`, and evidence is never averaged or upgraded across components.

Existing runtime aliases are normalized at the Decision Package v1.2 boundary:

```text
synthetic -> fixture
sandbox   -> partner_sandbox
sanctioned -> sanctioned_pilot
```

Legacy adapters may accept the aliases during migration, but new v1.2 packages,
receipts, API responses, and UI labels use only the canonical values.

Current evidence proves fixture and partner-sandbox operating loops, a live
Salesforce sandbox write, tenant-scoped identity and persistence primitives, and
the decision-package boundary. It does not prove production bank integration,
customer impact, causal lift, bank SSO, SCIM, or certification.

The UI must display evidence origin at the receipt or result level and show
measurement and claim status where a result is presented. It should not repeat
technical disclaimers on every working screen. Numeric pilot thresholds,
including employee response targets, are proposed calibration targets until
the institution approves a baseline, service window, and pre-registered plan.

## 4. Product Information Architecture

The authenticated product has six durable destinations.

| Destination | Primary question | Primary users | Owns |
| --- | --- | --- | --- |
| Today | What needs my attention now? | All roles | Role-scoped briefing and priority queue |
| Moments | What customer decisions need review? | Bank operators, owners | Qualified moments and human responses |
| Growth Plays | What decision programs are we operating? | Play owners, risk, admins | Configuration, versions, readiness, lifecycle |
| Results | Is the program creating measurable value? | Owners, executives, risk | Coverage, treatment/holdout results, claims |
| Governance | Can we explain and verify every decision? | Risk, audit, admins | Approvals, policy, ledger, model evidence |
| Connections | Where does evidence enter and action land? | Institution admins | Source, destination, identity, and outcome adapters |

Target routes:

```text
/app/today
/app/moments
/app/plays
/app/results
/app/governance
/app/connections
```

Compatibility redirects:

```text
/app/briefings -> /app/today
/app/outcomes  -> /app/results
/app/ledger    -> /app/governance?view=ledger
/app/onboarding -> /app/connections?connector=salesforce
/app/settings  -> /app/connections
```

Navigation is permission-driven. A user must not see a destination merely
because it exists. The server-provided access profile is authoritative.

## 5. Personas, Jobs, and Starting Experiences

### 5.1 Role model

Keep authorization roles coarse and durable. Use business-line scope, assigned
work queues, and entitlements for job-specific variation.

| Role | Core job | Default start | Key permissions |
| --- | --- | --- | --- |
| `bank_operator` | Review and act on assigned moments | Today | Read assigned moments; accept, modify, defer, or decline allowed actions |
| `growth_play_owner` | Own the program and its business result | Today | Draft versions; submit; view aggregate results; pause within authority |
| `risk_reviewer` | Validate policy, model, and decision controls | Governance | Review protocols; approve/revoke when independent; inspect evidence |
| `institution_admin` | Configure institutional access and integrations | Connections | Manage memberships, mappings, connectors, retention, and destinations |
| `executive_viewer` | Monitor portfolio value and operating risk | Results | Read aggregate results and program status; no customer-level access by default |
| `ventus_platform_admin` | Operate Ventus platform infrastructure | Governance | Cross-tenant operations through separately audited support access |

`executive_viewer` is a required addition to the current database role enum. It
must be read-only and must not automatically grant customer-level access.

The server access response must replace the current `operator | admin`
compression with this canonical shape:

```ts
type EnterpriseAccessProfile = {
  userId: string;
  tenantId: string;
  organizationId: string;
  role:
    | "ventus_platform_admin"
    | "institution_admin"
    | "growth_play_owner"
    | "bank_operator"
    | "risk_reviewer"
    | "executive_viewer";
  status: "active" | "pending" | "suspended";
  businessLineScopes: string[];
  queueScopes: string[];
  entitlements: string[];
  authProvider: string;
};
```

Permission summary:

| Capability | Operator | Play owner | Risk | Institution admin | Executive | Platform admin |
| --- | --- | --- | --- | --- | --- | --- |
| Read customer moments | Assigned only | No by default | Audit sample by policy | No | No | Break-glass only |
| Respond to allowed action | Yes | No | No | No | No | No |
| Draft or register a Growth Play version | No | Yes, in scope | No | No | No | No |
| Approve Growth Play business behavior | No | No | Yes, when independent | No | No | No |
| Approve connector mapping | No | No | Inspect only | Yes | No | No |
| View Results | Own queue only | Owned plays | Scoped review | System health only | Scoped aggregate | Tenant health only |
| View decision evidence | Assigned only | Aggregate or approved sample | Yes, in scope | Connector diagnostics only | Aggregate only | Metadata; break-glass for content |
| Manage membership and SSO | No | No | No | Yes | No | No |
| Register or sponsor a Skill candidate | No | Sponsor for owned play | Review only | Route attestation only | No | Register platform candidate |
| Pause a Skill | No | Request only | Yes, for control failure | Yes, for route or data risk | No | Emergency pause only |

### 5.1.1 Normative role boundaries

Authorization is server-enforced and defaults to deny. Navigation and disabled
controls are usability aids, not security boundaries. Every response is a
role-specific projection: endpoint access alone must not expose fields that the
role is prohibited from seeing.

**`bank_operator`**

- May read moments assigned to the subject's tenant, business-line scope, and
  queue scope; submit an approved response; and inspect the resulting delivery
  state.
- May see only the evidence needed to perform the assigned work and, when
  entitled, a scoped operational summary of that work.
- May not draft, register, or approve Growth Plays; configure connectors;
  inspect governance-wide evidence; manage Skills; or view holdout subjects.

**`growth_play_owner`**

- May draft and register immutable Growth Play versions within the subject's
  business-line scope, sponsor a Skill candidate for a specific play, and read
  aggregate capacity and result views for owned plays.
- May pause a play within registered authority but may not approve the same
  protocol version, approve connector mappings, promote a Skill alone, or act
  on customer moments.

**`risk_reviewer`**

- May inspect policy, decision, model, approval, exception, and evidence
  records; approve or reject a Growth Play protocol when independent from its
  registrant; approve or reject the quality and policy portion of a Skill
  transition; and pause a Skill on a critical control failure.
- May not draft business behavior, configure or activate connectors, act on
  customer moments, or promote or resume a Skill alone.

**`institution_admin`**

- May manage memberships, identity mappings, connector lifecycle, retention,
  data routes, destinations, and onboarding readiness for the institution.
- May attest the environment and data-route portion of a Skill transition.
- May not draft, register, or approve Growth Play business behavior; approve
  Skill quality; act on customer moments; or receive business-performance
  Results beyond connector, identity, and system health.

**`executive_viewer`**

- May read aggregate program status, capacity, measurement maturity, claim
  status, and approved results within scope.
- May not read customer-level moments or raw decision evidence and has no write,
  approval, connector, or Skill-management permission.

**`ventus_platform_admin`**

- May operate infrastructure, migrations, tenant health, and support tooling
  through separately logged support access; may register a platform-owned Skill
  candidate and invoke an emergency pause.
- Has no automatic cross-tenant customer-data access and may not approve an
  institution's business behavior, connector mapping, Skill promotion or
  resumption, or customer action. Break-glass access requires a reason,
  expiration, institution-visible receipt, and post-access review.

### 5.1.2 Separation-of-duties invariants

- A Growth Play registrant cannot approve the same protocol version. Approval
  records identify distinct authenticated subjects, the immutable protocol
  digest, decision, reason, timestamp, and version.
- Connector testing creates a receipt but never activates the connector.
  Institution-admin approval and a separate activate operation are required.
- A browser cannot author a Skill status, promotion result, claim status, or
  approval boolean. The server derives transitions from durable evidence and
  append-only approval receipts.
- Skill promotion requires three scoped decisions: business sponsorship from
  the Growth Play owner, quality and policy approval from the risk reviewer,
  and environment and data-route approval from the institution administrator.
- Platform support authority never substitutes for an institution approval.
- The MVP assigns one canonical role to each active user-and-tenant membership;
  business-line, queue, and entitlement fields narrow that role. Role unions
  and inferred composite roles are not supported. A UI label or job profile
  never grants permission.

### 5.2 Job profiles

Job profiles refine vocabulary and queues without creating new security roles.

Initial profiles:

- Consumer relationship banker
- Consumer growth-program owner
- Merrill financial advisor
- Merrill client associate
- Wealth growth-program owner
- Compliance or risk reviewer
- Salesforce/FSC administrator
- Enterprise identity administrator

Examples:

- A relationship banker and a financial advisor may both hold
  `bank_operator`; their business-line scope and queue assignments differ.
- A product executive may hold `executive_viewer` for Consumer Banking only.
- A risk reviewer may be scoped across multiple business lines but have no
  activation permission.

### 5.3 Starting experiences

**Bank operator**

- Starts on Today with no more than five ranked items.
- Sees urgency, customer token or bank-resolved name, qualified moment,
  recommended next step, due state, and destination state.
- Opens a Moment Card, reviews bounded evidence, and chooses an allowed response.
- Returns to the native system when the task has been delivered.

**Growth Play owner**

- Starts on Today with program exceptions, volume, capacity, and outcome
  coverage.
- Opens Growth Plays to draft or inspect a program version.
- Cannot self-approve a version that the control policy requires another role to
  approve.

**Risk reviewer**

- Starts on Governance with pending approvals, policy exceptions, model changes,
  and evidence gaps.
- Reviews the exact immutable protocol and change record, not mutable UI fields.

**Institution admin**

- Starts on Connections with expiring credentials, failed mappings, and setup
  tasks.
- Does not receive customer moments unless separately assigned `bank_operator`.

**Executive viewer**

- Starts on Results with a portfolio view: active plays, population reached,
  outcome coverage, measured results, capacity constraints, and claim status.
- Does not approve individual customer actions.

## 6. Screen Responsibilities

### 6.1 Today

Today is the attention layer inside Ventus. It replaces the current generic
Briefings framing.

It contains:

- a role-specific summary;
- ranked work or exceptions;
- program and outcome status relevant to the role;
- deep links to the exact Moment, Growth Play, Result, or Governance item;
- delivery status for Coworker summaries.

It does not contain:

- a second decision engine;
- raw transaction feeds;
- unbounded AI chat;
- all enterprise metrics;
- setup controls unrelated to the user's role.

### 6.2 Moments

Moments is the customer-level decision queue.

It contains:

- filters for business line, Growth Play, status, urgency, owner, and evidence
  class;
- reusable Moment Cards;
- a durable response history;
- destination receipts and links;
- explicit suppression, abstention, and holdout states for authorized users.

The default operator view hides holdout membership and unnecessary experiment
detail to avoid behavioral contamination. Owners and risk reviewers can inspect
aggregate assignment evidence.

### 6.3 Growth Plays

Growth Plays is a structured program studio, not a table of marketing ideas.

It contains:

- portfolio view with lifecycle, owner, population, readiness, capacity, metric,
  and current evidence class;
- guided creation using an approved schema;
- immutable version comparison;
- readiness checks;
- approval and change records;
- shadow, pilot, live, pause, and revoke controls according to role;
- links to related Moments, Results, and Governance records.

Natural-language assistance may help draft a play, but the saved artifact must
be a typed, validated contract. Free-form text is never executable policy.

### 6.4 Results

Results answers whether an operating program is creating value.

It contains:

- registered primary metric and outcome window;
- treatment and holdout counts;
- outcome coverage;
- observed result and uncertainty when allowed;
- business-claim and causal-claim status;
- data freshness and missing-feed alerts;
- capacity and employee-response effects;
- version comparison without mixing protocols.

It must not convert sandbox output into a business claim.

### 6.5 Governance

Governance joins the current ledger and control-plane evidence.

Views:

- Pending approvals
- Protocol versions
- Policy decisions and suppressions
- Model and skill versions
- Decision ledger
- Delivery reconciliation
- Exceptions and revocations
- Evidence export

The customer-facing bank operator should not need Governance to complete routine
work.

### 6.6 Connections

Connections is the institution-admin surface.

It contains:

- Sources: core, transaction, digital, product, and approved external evidence
- Destinations: Salesforce/FSC, bank workbench, campaign, digital, Outlook,
  Slack, and future adapters
- Outcomes: registered return feeds
- Identity: Cognito today, enterprise SAML/OIDC and SCIM target
- Mapping: institution object, field, action, and metric mappings
- Health: last successful receipt, failure, expiry, and environment
- Change control: draft, test, approve, activate, rotate, revoke

Connector secrets never enter the browser. A green connector means the server
completed a bounded health check; it does not imply production certification.

## 7. Canonical End-to-End Journey

### Phase 1: Configure

1. An institution admin establishes tenant identity, user scopes, and approved
   connectors.
2. A Growth Play owner chooses one business objective and one primary metric.
3. The owner binds approved sources, eligibility, policy, action catalog,
   owner roles, destinations, capacity, experiment design, and outcome feed.
4. Ventus compiles the configuration into an immutable protocol digest.

### Phase 2: Approve

5. Readiness checks run against the exact version.
6. Required reviewers inspect policy, data use, action boundaries, measurement,
   and model evidence.
7. An authorized subject other than the configurator records approval.
8. Approval applies only to that immutable protocol version and environment.

### Phase 3: Qualify

9. The source adapter receives sanctioned records and writes a source receipt.
10. Ventus normalizes records into approved evidence references.
11. The active deterministic or approved model-assisted runtime evaluates the
    evidence.
12. The runtime returns qualified, suppressed, or abstained.
13. Experiment assignment occurs before treatment decisioning; holdout bypasses
    the treatment action.

### Phase 4: Review and execute

14. A Decision Package is created for a qualified treatment moment.
15. Coworker surfaces the moment in Today and approved outbound channels.
16. When required, the assigned employee accepts, modifies within the approved
    action catalog, defers, or declines with a reason.
17. Ventus reserves an idempotent delivery.
18. The destination adapter writes bounded workflow records and returns
    immutable external receipts.
19. The employee completes the work in the native system.

### Phase 5: Measure and improve

20. Approved outcome adapters return registered observations.
21. Ventus links evidence, protocol, assignment, decision, response, delivery,
    and outcome in the decision-outcome graph.
22. Results remain "measuring" until coverage and sample gates pass.
23. Offline evaluation may propose a new Skill or Growth Play version.
24. No production behavior changes until the new version passes evaluation,
    shadow operation, and approval.

## 8. Moment Card Contract

The Moment Card is the reusable human decision component. It has full, compact,
and notification representations backed by the same Decision Package.

### 8.1 Primary view

The first view must answer five questions in under ten seconds:

1. What changed?
2. Why does it matter now?
3. What does Ventus recommend?
4. What do I need to decide?
5. Where will the work go?

Required fields:

```text
moment title
customer or household display reference resolved by the bank
Growth Play and business line
one-sentence evidence summary
timing or expiration
confidence band, not false precision
recommended action
assigned owner or queue
policy state
response controls
destination status
```

### 8.2 Expandable detail

Expandable detail may include:

- bounded evidence labels and provenance;
- rationale and approved alternatives;
- policy controls and human-review requirement;
- model or deterministic method;
- protocol and Decision Package identifiers;
- prior responses and delivery receipts;
- outcome window.

Raw transactions, unrestricted customer profiles, credentials, hidden model
reasoning, and other customers' data must not be embedded in the package.

### 8.3 Response controls

The card supports:

- Accept recommended action
- Choose an approved alternative
- Defer with reason and date
- Decline with reason

If policy suppresses the action, operator activation controls are absent. If the
runtime abstains, the card may show a reviewable exception only when the Growth
Play explicitly supports manual triage.

### 8.4 Moment state model

Do not represent the end-to-end journey with one overloaded `status`. A moment
has four independent, server-authored state axes:

```ts
type MomentState = {
  qualification:
    | "observed"
    | "qualified"
    | "suppressed"
    | "abstained";
  assignment:
    | "not_assigned"
    | "treatment"
    | "holdout";
  response:
    | "not_required"
    | "pending"
    | "accepted"
    | "modified"
    | "deferred"
    | "declined";
  workflow:
    | "not_applicable"
    | "ready"
    | "reserved"
    | "delivered"
    | "failed"
    | "reconciled";
  outcome:
    | "not_opened"
    | "measuring"
    | "measured"
    | "closed";
};
```

Invariants:

- `suppressed` and `abstained` cannot have a treatment delivery.
- `holdout` cannot move to `ready` or `delivered` for the treatment action.
- `modified` must select another action from the same approved catalog.
- `reserved` must precede `delivered`, `failed`, or `reconciled`.
- An ambiguous connector failure remains `reserved` until reconciled; it is not
  automatically retried.
- `measuring` begins from registered assignment time, not task completion time,
  unless the immutable protocol explicitly defines another anchor.
- `measured` means sample and coverage gates passed. A single observed outcome
  does not make the program measured.
- A human response, delivery, or outcome correction appends a new event; it
  does not rewrite the original evidence.

### 8.5 Representations

**Ventus full card**

- Used in Today and Moments.
- Provides evidence, response, governance detail, and receipts.

**Native compact card**

- Used in Salesforce or a bank workbench.
- Contains the action, timing, summary, Decision ID, and deep link.
- The native platform owns assignment, calendar, case, and task completion UI.

**Coworker notification**

- Used in Outlook or Slack.
- Contains minimal customer information, urgency, reason, and a secure deep link.
- It does not contain unrestricted transaction evidence or an executable action
  when the channel cannot enforce the required policy and identity.

## 9. Decision Package Contract

`DecisionPackage` v1.1 remains the current compatible contract. The next version
is additive and introduced as v1.2; existing consumers must continue to parse
v1.1 during the compatibility window.

The v1.2 package is the immutable decision at qualification time. Employee
responses, workflow state, external record identifiers, and outcomes are
separate append-only receipts joined into a Moment projection. They must not
mutate the original package.

### 9.1 Required v1.2 additions

```ts
type DecisionPackageV12 = Omit<
  DecisionPackageV11,
  "schemaVersion" | "subject" | "moment" | "recommendation" |
  "governance" | "workflow" | "outcome"
> & {
  schemaVersion: "1.2";
  evidenceClass: "fixture" | "partner_sandbox" | "sanctioned_pilot";
  subject: {
    token: string;
    scope: "customer" | "household" | "account" | "business";
    displayReference?: string; // destination-resolved, never canonical PII
  };
  moment: {
    type: string;
    summary: string;
    confidence: number;
    confidenceBand: "low" | "medium" | "high";
    observedAt: string;
    expiresAt?: string;
    urgency: "routine" | "time-sensitive" | "urgent";
    evidence: Array<{
      id: string;
      label: string;
      confidence: number;
      source: string;
      receiptId?: string;
      observedAt?: string;
    }>;
  };
  recommendation: {
    selectedAction: DecisionAction;
    alternatives: DecisionAction[];
    rationale: string;
    actionCatalogVersion: string;
  };
  decisionMethod: {
    runtimeType: "deterministic" | "model_assisted";
    runtimeVersion: string;
    skillVersions: string[];
    modelInvocation?: {
      provider: string;
      model: string;
      modelArtifactVersion: string;
    };
  };
  governance: {
    policyStatus: "cleared" | "suppressed" | "review";
    controls: string[];
    humanReviewRequired: boolean;
    assignmentArm: "treatment" | "holdout";
    policyVersion: string | null;
    protocolId: string;
    // Fixture and partner-sandbox packages are explicit when no independently
    // approved protocol exists. They are never eligible for a bank claim.
    protocolApprovalId: string | null;
    approvalStatus: "approved" | "not_attested";
    exceptionStatus: "none" | "open" | "resolved";
  };
  workflowIntent: {
    connector: string;
    destination: string;
    ownerRole: string;
    dueAt?: string;
  };
  measurementPlan: {
    metric: string;
    outcomeEventTypes: string[];
    outcomeSourceSystems: string[];
    windowDays: number;
  };
  packageDigest: string;
};
```

### 9.2 Invariants

- `tenantId`, `decisionId`, `growthPlay.protocolId`, and subject token are
  immutable.
- `approvalStatus: "not_attested"` means the package is fixture or partner-
  sandbox evidence only. It must not be presented as a sanctioned operating
  protocol or a bank-approved result.
- A connected Console run resolves the latest reviewed protocol for the tenant,
  Growth Play, and business line. If that latest review is not approved, the
  runtime fails closed; it never falls back to an older approved version.
- Approval is checked again when delivery is reserved. Revoking a protocol
  blocks queued Moments from creating new downstream workflow records.
- The package references source receipts; it does not replace the evidence
  ledger.
- Recommended and alternative actions come from the approved action catalog.
- Holdout packages cannot be delivered as treatment actions.
- `packageDigest` covers the canonical package before the digest field is added.
- The server seals the package before it is shown to a user or connector.
- Response receipts reference the package digest and server-verified actor.
- Delivery receipts are idempotent per package, approved action, and
  destination.
- Outcome receipts reference the package and immutable assignment but remain
  outside the package.
- Destination-specific objects never become the canonical Ventus schema.

### 9.3 Projection contract

The product joins the immutable package with append-only records to render the
current Moment:

```text
DecisionPackage v1.2
  + assignment record
  + employee response history
  + delivery reservation and terminal receipt
  + outcome observations
  = current authorized Moment projection
```

The projection may show current status and destination links. It is disposable
and can be rebuilt from durable records. Salesforce Task IDs, Outlook message
IDs, mutable owner assignments, task completion, and measured results belong
only in receipts or projections.

### 9.4 Compatibility decision

- v1.2 writers also produce the existing v1.1-compatible fields during one
  compatibility window.
- v1.1 consumers ignore v1.2 additions and continue to render the bounded
  recommendation.
- New receipt-aware surfaces require v1.2 and must not infer mutable state from
  the legacy `workflow` or `outcome` fields.
- A protocol pins one package schema version. Upgrading the package schema
  requires a new protocol version and shadow verification.

## 10. Growth Play Contract

A Growth Play is a versioned, governed decision program. It is not one model,
one prompt, one campaign, or one Salesforce task.

### 10.1 Schema

The existing compiled v1.0 contract remains valid. A future v1.1 must add the
following structured concepts without weakening current exact-key validation:

| Section | Required content |
| --- | --- |
| Identity | Play ID, semantic version, tenant, business line, owner, environment |
| Objective | Business objective, one primary P&L metric, hypothesis, time horizon |
| Population | Subject scope, eligibility version, exclusions, consent basis |
| Evidence | Approved source receipts, schemas, record sources, rails, freshness |
| Decision | Detector or planner version, confidence/abstention rules, skill versions |
| Policy | Required policy IDs, policy version, vulnerability and suppression rules |
| Actions | Closed catalog, owner roles, destinations, environments, instructions |
| Capacity | Queue, service-level target, maximum volume, overflow behavior |
| Experiment | Assignment design, holdout, minimum sample, contamination controls |
| Measurement | Outcome event, source, window, coverage, claim policy |
| Lifecycle | Deployment state, effective dates, superseded version |

The compiled protocol contains behavior. Mutable operational state such as
current lifecycle, queue capacity, and connector health is stored separately and
referenced by version. Editing behavior always creates a new protocol version.

The target split is:

```ts
type GrowthPlayBehaviorV11 = {
  contract_version: "1.1";
  growth_play_id: string;
  version: string;
  business_line: string;
  objective: {
    statement: string;
    primary_metric: string;
    hypothesis: string;
    time_horizon_days: number;
  };
  subject: {
    scope: "customer" | "household" | "account" | "business";
    eligibility_version: string;
    exclusion_policy_ids: string[];
  };
  source: {
    receipt_source_systems: string[];
    schema_versions: string[];
    record_sources: Array<{
      source_system: string;
      allowed_record_types: string[];
      allowed_rails: string[];
      maximum_age_hours: number;
    }>;
  };
  decision: {
    runtime_version: string;
    skill_versions: string[];
    minimum_confidence: number;
    abstention_policy: string;
  };
  policy: {
    version: string;
    required_policy_ids: string[];
  };
  actions: Array<{
    action_id: string;
    owner_role: string;
    connector: string;
    destination: string;
    destination_environment: "sandbox" | "production";
    instruction_template_version: string;
  }>;
  experiment: {
    design: "binary";
    holdout_pct: number;
    assignment_unit: "customer" | "household" | "account" | "business";
    contamination_policy: string;
  };
  measurement: {
    metric: string;
    outcome_event_types: string[];
    outcome_source_systems: string[];
    outcome_window_days: number;
    minimum_per_arm: number;
    minimum_coverage: number;
    claim_policy_version: string;
  };
};

type GrowthPlayDeployment = {
  tenant_id: string;
  decision_protocol_id: string;
  environment: "sandbox" | "production";
  business_owner_subject: string;
  lifecycle:
    | "registered"
    | "in_review"
    | "approved"
    | "shadow"
    | "pilot"
    | "live"
    | "paused"
    | "revoked"
    | "superseded";
  connector_mapping_version: string;
  capacity_profile_version: string;
  effective_at?: string;
  ends_at?: string;
  superseded_by_protocol_id?: string;
};
```

The protocol digest covers `GrowthPlayBehaviorV11`. Deployment and connector
health do not alter the digest. Deployment transitions are append-only events
that reference the protocol, actor, tenant, environment, reason, and change
record.

### 10.2 Skills

A Skill is a reusable, independently evaluated technical capability used by one
or more Growth Plays.

Examples:

- merchant normalization;
- payroll detection;
- liquidity-event detection;
- relationship migration detection;
- intervention ranking;
- employee brief generation;
- Salesforce delivery;
- Outlook notification;
- outcome matching;
- lift calculation.

A Skill version records:

```text
skill ID and semantic version
input and output schema
runtime type: deterministic, model-assisted, connector, measurement
provider/model/prompt where applicable
evaluation dataset and metrics
latency and cost
policy and fairness results
approval status and effective environment
```

Growth Plays improve by referencing newly approved Skill versions in a new
immutable protocol. They do not self-modify in production.

### 10.3 Lifecycle

```text
Draft
  -> Registered
  -> In review
  -> Approved
  -> Shadow
  -> Pilot
  -> Live
  -> Paused or Revoked
  -> Superseded
```

Rules:

- Draft is mutable and non-executable.
- Registration creates an immutable digest.
- Approval names the exact version and environment.
- Shadow produces decisions but cannot activate.
- Pilot uses bounded population, capacity, and evidence claims.
- Live requires the institution's production gates.
- Pause stops new assignment without erasing evidence.
- Revoke is an append-only control event.
- Supersede points to a newly approved version.

### 10.4 Readiness gates

A play cannot enter Shadow until:

- the objective and one primary metric are registered;
- source schemas and evidence use are approved;
- eligibility, consent, exclusion, and policy versions exist;
- the action catalog and owners are complete;
- destination mappings pass a bounded sandbox test;
- abstention and failure behavior are defined;
- the outcome event and source are registered.

A play cannot enter Pilot until:

- independent approval is recorded;
- assignment and holdout behavior are verified;
- operator capacity and service level are accepted;
- identity, tenant isolation, secret handling, and receipts are verified;
- model-assisted Skills, if any, pass quality, grounding, policy, fairness,
  latency, and cost gates;
- the evidence class and prohibited claims are visible.

A play cannot enter Live until institution-specific security, privacy, legal,
model-risk, change-management, production connector, SSO/SCIM, retention,
incident, and outcome-feed gates pass.

### 10.5 Approval model

- Configurator and approver must be different server-verified subjects when the
  policy requires separation of duties.
- `growth_play_owner` submits business configuration.
- `risk_reviewer` approves policy and model evidence.
- `institution_admin` approves connector and data mappings.
- The institution defines whether one consolidated approval or multiple control
  approvals are required.
- Every approval is append-only and references a change record.
- Revocation applies immediately to new assignments.

### 10.6 Growth Play Studio decision

The Studio uses one guided six-step flow. It does not expose the compiled JSON
as the primary experience and does not begin with an open-ended AI prompt.

1. **Outcome:** choose one institution-approved objective, one primary P&L
   metric, the accountable owner, hypothesis, and time horizon.
2. **Moment:** define subject scope, eligible population, exclusions, approved
   evidence, freshness, the qualified moment, and abstention behavior.
3. **Action:** choose a closed action catalog, accountable employee role,
   destination, service level, capacity, and overflow behavior.
4. **Controls:** attach consent, policy, vulnerability, suitability, contact,
   human-review, and suppression rules.
5. **Proof:** register assignment unit, holdout, outcome event and source,
   outcome window, minimum sample, coverage, and claim policy.
6. **Review:** inspect the compiled summary, unresolved assumptions, version
   diff, representative qualified/suppressed/abstained examples, connector
   test, capacity estimate, and readiness result.

The persistent workspace shows these three panes:

```text
left: six-step configuration and completion state
center: current structured section
right: live readiness, assumptions, preview, and impact evidence
```

The right pane never predicts lift before measured evidence exists. Before a
pilot it may show estimated eligible population, expected work volume, employee
capacity, evidence coverage, and measurement feasibility, each labeled with its
source and confidence.

AI assistance is available inside a section as **Draft with Ventus**. It may
propose typed values, explain missing information, or compare approved options.
Every proposal is visibly marked, editable, and non-executable until the owner
accepts it into the structured draft.

The user can save an incomplete draft at any point. The following controls are
separate and increasingly consequential:

```text
Save draft -> Run readiness -> Register version -> Submit for review
  -> Approve -> Start shadow -> Start bounded pilot
```

Rules:

- `Save draft` is always reversible and creates no executable behavior.
- `Run readiness` produces field-level failures and warnings; it is not an
  approval.
- `Register version` compiles and seals the exact behavior digest.
- `Submit for review` routes business, risk/model, and connector/data sections
  to their authorized reviewers.
- An owner cannot edit a registered version; changes create a new draft.
- The configurator cannot satisfy a required independent approval.
- A connector health check, representative dry run, and outcome contract must
  pass before Shadow.
- Only authorized deployment transitions can move an approved version to
  Shadow or Pilot.

The MVP supports one action destination and one primary outcome per play.
Additional destinations or primary metrics require another play or a future
contract version.

### 10.7 Outcome measurement decision

Each protocol pre-registers one primary outcome metric and one intent-to-treat
estimand. Secondary metrics are exploratory and cannot determine pilot success.

The measurement sequence is fixed:

1. Resolve the eligible assignment unit and create immutable treatment or
   holdout assignment before treatment decisioning.
2. Open the outcome window at assignment time unless the registered protocol
   names another objective anchor.
3. Accept outcomes only from the registered source, event types, metric,
   subject token, and window.
4. Treat missing as missing. A valid zero must arrive as an explicit
   observation.
5. Keep corrections append-only and select the latest valid observation inside
   the window.
6. Report treatment and holdout counts, coverage, means, absolute and relative
   difference, uncertainty interval, attrition, and claim state.

Development and sandbox runs may use the existing defaults of 30 observed
subjects per arm and 90 percent outcome coverage, but they can never produce a
business claim. A sanctioned pilot must freeze a power-informed minimum sample,
coverage threshold, outcome window, assignment salt custody, contamination
policy, and analysis plan before the first assignment. Thresholds cannot be
relaxed after results are opened.

Result states are:

| State | Meaning |
| --- | --- |
| Awaiting outcomes | Outcome window is open but no valid return feed exists |
| Measuring | Valid observations exist but the window, sample, or coverage gate remains open |
| Descriptive | Gates passed and Ventus can report the registered comparison |
| Review-ready | Randomization and integrity checks passed; independent review is required |
| Approved claim | The institution approved the exact method, language, and audience |

`measured` in the underlying state model means the descriptive gate passed. It
does not automatically authorize causal language. Causal claims require
pre-registered randomization, balance, attrition, contamination, noncompliance,
and multiple-testing review by an accountable institution-approved reviewer.

Employee acceptance, task completion, response time, and capacity are operating
metrics. They explain delivery performance but do not replace the registered
P&L outcome.

#### 10.7.1 Authoritative outcome-source hierarchy

The primary outcome must come from the institution system that owns the
economic event. A workflow system may report that work happened, but it cannot
by itself prove deposit retention or net new assets.

The MVP therefore has two distinct return paths. Salesforce/FSC returns
treatment workflow observations such as assignment, response, completion,
timing, reason, external record, and reconciliation state. It has no holdout
treatment record and cannot satisfy the primary P&L metric. A bank-owned ledger,
books-and-records system, or certified outcome view returns the registered
economic observation for both treatment and holdout. Ventus joins both paths
to its persisted assignment and Decision Package lineage; it never substitutes
workflow completion for a missing economic outcome.

Source precedence is:

1. **Economic system of record:** core deposit ledger, wealth books and records,
   or another institution-approved ledger that owns the posted balance or flow.
2. **Certified institution outcome view:** a bank-governed warehouse or
   calculation layer may return the registered metric when its lineage,
   reconciliation, version, and accountable owner are approved.
3. **Workflow system:** Salesforce/FSC, a bank workbench, Outlook, or Slack may
   return assignment, acceptance, completion, timing, and reason codes as
   operating observations only.
4. **Sandbox or fixture:** proves the contract and mechanism but cannot support
   a sanctioned-pilot result.

The MVP does not ask Ventus to reconstruct bank accounting from raw
transactions. The institution computes one pre-registered primary metric value
for every assigned subject, including holdout, and returns only the approved
outcome envelope:

```ts
type AuthoritativeOutcomeObservation = {
  subjectToken: string;
  metric: string;
  value: { amount: number; currency: "USD" } | null;
  eventType: string;
  sourceSystem: string;
  sourceRecordId: string;
  sourceVersion: string;
  occurredAt: string;
  observedAt: string;
  correctionSequence: number;
  reasonCode?: string;
};
```

The feed cannot supply tenant, experiment, treatment arm, decision, protocol,
or claim status. Ventus resolves those from the persisted assignment and
approved Growth Play. A null value is missing, not zero. A valid zero must be
sent explicitly.

The first pilot uses a daily batch or approved event feed; real-time outcome
streaming is not required. Treatment and holdout must use the same source,
metric version, cadence, correction rules, and freshness threshold. A source
change creates a new protocol version and cannot be mixed into an open result.

**Consumer Deposit Primacy default:** the authoritative source is the
institution's deposit ledger or certified deposit-outcome view. The registered
`deposit_retained` value is the USD eligible deposit balance at the registered
measurement anchor for the assigned subject. Eligible account types,
aggregation level, end-of-window anchor, treatment of closed accounts, and
baseline balance snapshot are frozen before assignment. The MVP intent-to-treat
result compares mean end-anchor value between treatment and holdout; any
baseline-adjusted estimator requires a separately approved analysis version.
Salesforce completion is an operating metric only.

**Merrill Qualified Wealth Growth default:** the authoritative source is the
wealth books-and-records platform or certified NNA view. Registered
`net_new_assets` includes posted and settled qualified external flows during
the window, expressed as signed USD inflows minus outflows. It excludes market
appreciation, internal transfers, reversals, and other institution-defined
non-NNA movement. The MVP intent-to-treat result compares mean qualified NNA
between treatment and holdout. Salesforce opportunity, referral, meeting, and
task states are operating metrics only.

For the first real-bank pilot, implement Consumer Deposit Primacy first. Reuse
the same envelope and validation path for Merrill only after its NNA owner,
source, exclusions, timing, and correction contract are approved.

## 11. AI and Model Boundary

AI may:

- propose a typed Growth Play draft from a stated objective;
- normalize ambiguous transaction or engagement evidence;
- detect complex temporal patterns;
- rank approved interventions;
- generate a concise employee brief from bounded evidence;
- explain a recommendation in approved language;
- identify candidate segments or Skills for offline evaluation.

AI may not:

- invent an executable action outside the approved catalog;
- override consent, policy, eligibility, holdout, or connector authorization;
- change a production protocol;
- claim lift without measurement gates;
- expose hidden chain-of-thought;
- write to a destination without a valid Decision Package and delivery
  reservation.

For the MVP:

- deterministic baseline remains active;
- model candidates run in shadow;
- the same typed output contract evaluates all providers;
- promotion requires task-specific quality, zero critical grounding/policy
  failures, acceptable fairness, latency, and cost;
- policy enforcement, assignment, idempotency, and claims remain deterministic.

The multi-model strategy is task routing, not model voting by default. Use the
least expensive model that passes the task gate, with escalation for ambiguity
or material impact.

### 11.1 Model-shadow promotion decision

Promotion applies to one versioned model-assisted Skill for one task and one
Growth Play context. A provider or model is never approved globally.

The promotion path is:

```text
candidate
  -> frozen offline benchmark
  -> repeated evaluation
  -> sanctioned-data shadow
  -> independent review
  -> assisted pilot
  -> separately approved live version
```

The deterministic runtime remains the active baseline until the Skill reaches
assisted pilot. Shadow candidates receive the same approved evidence available
to the baseline, write typed predictions and evaluation receipts, and cannot
alter assignment, operator recommendations, or destination delivery.

Before candidate predictions are opened:

- at least two independent reviewers label and adjudicate the benchmark;
- benchmark cases, expectations, slice definitions, and scoring are frozen and
  hash-bound;
- the deterministic baseline is run and retained;
- critical-failure definitions and the cost/latency budget are registered.

Employee brief generation is the first model-assisted promotion candidate. It
operates after deterministic qualification and action selection, uses only the
bounded Decision Package projection, and cannot change qualification, ranking,
policy, assignment, action, destination, or claim fields. Intervention ranking
is the shadow-only moat track for the next implementation cycle and cannot
alter the active recommendation or any operator or delivery surface.
Model-assisted moment qualification is not in the next-cycle scope.

The current sandbox evaluation profile for intervention-ranking and
employee-brief Skills uses these planning gates:

- 100 percent schema-valid output;
- zero fabricated evidence references;
- zero actions outside the approved catalog;
- zero policy, consent, holdout, tenant, or business-line violations;
- at least 95 percent case acceptance on the frozen benchmark;
- at least a two-percentage-point quality improvement over the deterministic
  baseline;
- no material regression on registered ambiguity, suppression, vulnerability,
  business-line, or demographic-proxy slices;
- all hard gates pass on three independently captured runs;
- mean model cost no greater than USD 0.02 per evaluated case and p95 runtime no
  greater than five seconds, unless the registered Skill budget is stricter.

The acceptance rate, improvement delta, repeat count, cost, runtime, shadow
volume, and shadow duration are calibration proposals until registered for the
institution and task. Schema validity and zero fabricated evidence, catalog,
policy, consent, holdout, tenant, business-line, privacy, or critical grounding
failures remain hard controls.

The current sanctioned-data shadow planning profile uses at least 500 eligible
cases or 30 consecutive days, whichever is later. It must show:

- zero critical failures;
- stable quality and abstention by registered slice;
- no meaningful increase in operator overrides or unsafe escalation;
- cost and latency inside the registered budget;
- complete model, prompt, routing, evidence, and prediction receipts.

If a pilot cannot reach this volume, the candidate remains an evaluation
artifact and cannot be described as promoted.

Promotion to assisted pilot requires append-only approval from:

- the Growth Play owner for business usefulness and capacity;
- the risk or model reviewer for quality, policy, fairness, and limitations;
- the institution administrator for the approved environment and data route.

The promoted protocol pins the exact Skill, provider route, model artifact,
prompt, schemas, thresholds, fallback, and budget. Runtime policy, eligibility,
assignment, action validation, idempotency, and claims remain deterministic.
The model may abstain or fall back to the deterministic baseline; it may never
fail open.

Any critical failure, contract drift, material slice regression, budget breach,
or model/provider change pauses the Skill and restores the last approved
deterministic or model-assisted version. Learning produces a proposed new Skill
version; it never silently modifies the active version.

### 11.2 Normative Skill lifecycle

The MVP uses five states. A Skill is an immutable, versioned capability bound
to one tenant, business line, task, and Growth Play context. Promotion is never
provider-wide or model-wide.

```text
draft
  -> shadow
  -> promotion_review
  -> promoted
  -> paused
```

| State | Runtime effect | Entry requirements | Exit authority |
| --- | --- | --- | --- |
| `draft` | None | Typed input/output schema, exact task and context, provider route, model artifact, prompt, fallback, budget, and digest | Owner sponsors; risk and institution admin approve shadow scope |
| `shadow` | Writes typed predictions and evaluation receipts only; cannot alter ranking, recommendations, assignment, or delivery | Frozen benchmark and baseline receipt; distinct owner sponsorship, risk scope approval, and institution data-route approval | Server derives eligibility for review from registered gates |
| `promotion_review` | Same as shadow | Offline and sanctioned-shadow gates satisfied; immutable evaluation digest created | Three independent scoped approval receipts |
| `promoted` | Eligible to be pinned by a new Growth Play protocol; does not change live behavior by itself | Business, risk/model, and environment approvals all bind the same Skill and evaluation digests | A separately approved Growth Play version activates use; a failure or authorized pause stops it |
| `paused` | No new model-assisted decisions; deterministic approved fallback resumes | Automatic critical gate or drift trigger, risk pause, institution route/data pause, or audited platform emergency pause | No in-place resume in the MVP; create and approve a new Skill version |

The transition API accepts actions, not target states:

```ts
type SkillTransitionAction =
  | "submit_shadow"
  | "request_promotion"
  | "pause";
```

Each transition requires the expected version, current Skill digest,
idempotency key, authenticated actor, reason, and applicable evidence or
approval receipt identifiers. The server loads and verifies the referenced
artifacts, derives the next state, appends the transition receipt, and rejects
stale or repeated writes. `request_promotion` can create
`promotion_review`; it cannot directly create `promoted`.

Approvals are append-only resources, not fields on the Skill. Revocation or a
material change creates a new decision record and pauses or supersedes the
version; it never rewrites history. Provider, model, prompt, schema, threshold,
fallback, budget, benchmark, data route, or Growth Play changes require a new
Skill version.

The following remain deterministic and outside the Skill boundary:

- policy and consent enforcement;
- eligibility and suppression;
- treatment or holdout assignment;
- action-catalog validation;
- connector authorization and idempotency;
- measurement and claim eligibility.

## 12. Coworker

Coworker is Ventus's attention and briefing layer. It is not a second decision
engine and does not own customer truth.

Coworker:

- assembles role-specific Today briefings from governed moments;
- delivers minimal summaries to approved channels;
- deep-links users to the exact Moment or native workflow record;
- records delivered, opened, acknowledged, and failed events when the channel
  supports them;
- respects quiet hours, capacity, severity, and retention configuration;
- suppresses customer detail when channel policy does not allow it.

Channel order:

1. Ventus Today
2. Outlook
3. Slack
4. Future institution-approved channels, including Teams where relevant

Outbound content is a projection of the Decision Package. It must never create
an independent recommendation.

## 13. System Ownership and Integration Boundaries

| Capability | Ventus owns | Institution or destination owns |
| --- | --- | --- |
| Customer identity | Opaque subject token and approved linkage | Golden customer/household/account record and PII |
| Raw transactions | Approved receipt references and derived evidence | Source records, retention, correction |
| Decision program | Growth Play protocol, versions, approvals | Business objective, policy authority, product catalog |
| Qualification | Decision result, abstention, evidence links | Source-data quality and institution eligibility inputs |
| Human response | Canonical response receipt | Employee identity and native workflow behavior |
| Workflow | Delivery reservation and immutable receipt | Task, case, calendar, outreach, record assignment |
| Communication | Approved summary and deep link | Mail/chat transport, archive, channel policy |
| Measurement | Assignment, outcome linkage, coverage, analysis | Authoritative outcome events and metric definitions |
| AI | Skill versions, evaluation, routing, model evidence | Institution model-risk approval and prohibited uses |

### Salesforce/FSC

Salesforce remains the customer relationship and employee workflow surface.
Ventus writes:

- an optional bounded `Ventus_Decision__c` mirror or institution-approved
  equivalent;
- a linked Task, Referral, or other mapped action object;
- Decision ID, Growth Play, action, timing, owner, policy state, and deep link.

Salesforce returns:

- assignment and completion state;
- employee response when Salesforce is the response surface;
- institution-approved workflow or relationship events;
- economic outcomes only when Salesforce is explicitly certified as the
  institution's authoritative outcome view for that metric.

Comments are a demo fallback, not the production integration contract.

### Outlook and Slack

These are notification and acknowledgement surfaces. They do not replace
Salesforce, the bank workbench, or the Ventus decision record.

### Core, transaction, and digital systems

These systems remain sources of evidence and outcomes. Ventus receives only the
approved fields and retains tokenized references according to institutional
policy.

### 13.1 Server service boundary

The following are logical service contracts. Physical API Gateway paths may
differ, but the authorization and ownership boundary must remain.

| Operation | Allowed roles | Server responsibility |
| --- | --- | --- |
| Resolve access profile | Any authenticated member | Return tenant, canonical role, scopes, queues, entitlements, status |
| Read Today | All active roles | Build a role-scoped projection from durable records |
| Search Moments | Operator, owner, risk as scoped | Enforce tenant, business-line, queue, and customer-level permissions |
| Read Moment | Assigned operator, scoped owner/risk | Return Decision Package projection and allowed responses |
| Record response | Assigned operator | Validate action catalog, actor, current state, and append response |
| Reserve delivery | Authorized runtime after valid response | Validate protocol, policy, assignment, connector scope, and idempotency |
| Reconcile delivery | Connector service or admin | Append delivered or failed receipt without changing request identity |
| Read Growth Plays | Owner, risk, admin, executive as scoped | Return protocol and deployment projections appropriate to role |
| Save draft | Growth Play owner | Validate structured draft; do not make it executable |
| Register protocol | Growth Play owner | Compile canonical behavior and persist immutable digest |
| Record approval | Authorized independent reviewer | Append approval or revocation for exact protocol and environment |
| Transition deployment | Authorized owner/reviewer/admin policy | Validate readiness and append lifecycle event |
| Read Results | Owner, risk, executive as scoped | Compute version-safe coverage and claims from durable evidence |
| Read Governance | Risk and authorized admins | Return approvals, policies, ledger, model evidence, and reconciliation |
| Manage Connections | Institution admin | Discover, test, map, approve, rotate, and revoke bounded adapters |
| Deliver Coworker briefing | Approved briefing service | Project existing decisions; enforce channel policy and record receipt |

Minimum logical endpoint groups:

```text
/access
/today
/moments
/moments/{decision_id}/responses
/moments/{decision_id}/deliveries
/growth-plays/drafts
/growth-plays/protocols
/growth-plays/{protocol_id}/approvals
/growth-plays/{protocol_id}/deployments
/results
/governance
/connections
/briefings/deliveries
```

Mutating requests require:

```text
verified tenant and subject
canonical role and scope
request schema version
expected current state or version
idempotency key
actor session ID
client request timestamp
change record or reason where required
```

Responses that create durable evidence return:

```text
record ID
tenant ID
schema or protocol version
recorded timestamp
server-authoritative state
receipt sequence or hash reference
external receipt when applicable
```

The browser must not:

- infer an administrative role from an email domain;
- select an authoritative tenant through session storage;
- calculate policy, assignment, readiness, or lift;
- persist the canonical Moment or ledger in browser storage;
- call Salesforce, Outlook, Slack, Plaid, or a bank system with long-lived
  credentials.

### 13.2 Durable event vocabulary

All durable events use a versioned envelope containing tenant, event ID, event
type, subject token where applicable, actor or service identity, timestamp,
schema version, correlation ID, causation ID, protocol ID, and payload digest.

Initial event types:

```text
source.received
protocol.registered
protocol.approval_recorded
deployment.transitioned
assignment.created
decision.qualified
decision.suppressed
decision.abstained
response.recorded
delivery.reserved
delivery.delivered
delivery.failed
delivery.reconciled
briefing.delivered
briefing.engaged
outcome.observed
measurement.coverage_updated
measurement.result_recorded
```

UI projections may rename events for users, but integrations and evidence
exports use the stable event vocabulary.

## 14. Enterprise Requirements

### 14.1 Tenant and identity

- Every durable record has a tenant ID.
- Database row-level security is enabled and forced for runtime roles.
- Tenant context comes from verified server identity, never a browser selector.
- Cognito is the current authentication provider; enterprise SAML/OIDC and SCIM
  are required for production onboarding.
- Support access is time-bound, separately authorized, and audited.

### 14.2 Authorization

- The server returns role, business-line scopes, entitlements, and status.
- UI visibility is convenience; APIs enforce authorization.
- Customer-level access requires both a role and an allowed business-line or
  queue scope.
- Connector administration, play approval, and activation are distinct
  permissions.

### 14.3 Sensitive data

- Use opaque customer, household, account, and employee tokens in Ventus
  evidence where possible.
- Resolve display names in the institution boundary or approved destination.
- Do not place secrets, raw credentials, broad Salesforce access tokens, or raw
  transactions in browser storage.
- Define field-level allowlists, retention, deletion, export, and legal-hold
  behavior per tenant.

### 14.4 Audit and reliability

- Protocols, approvals, assignments, decisions, responses, deliveries, and
  outcomes are durable and tenant-scoped.
- Decision and evidence events are append-only or versioned.
- Delivery is idempotent and reconciled before retry after ambiguous failure.
- Every material event includes actor/session, timestamp, version, and receipt.
- Connector and model failures fail closed or abstain according to the protocol.

### 14.5 Connector boundary

- Credentials reside in AWS Secrets Manager and are used server-side.
- Connector sessions are short-lived, tenant-bound, actor-bound, and
  capability-scoped.
- Presenter-demo sessions and authenticated product sessions are separate
  security purposes. A presenter session may exercise explicitly labeled
  sandbox integrations, but it cannot authorize a Growth Console mutation.
- Product connector capabilities are minted only after the server resolves the
  active Aurora membership, canonical role, business-line scopes, queue scopes,
  and entitlements. Cognito group names alone are not sufficient authorization.
- The Growth Console never receives a generic Salesforce write capability.
  Delivery follows a server-prepared decision, recorded human response,
  reservation, and idempotent connector request.
- Discovery and mapping are admin-only.
- Operators receive only the specific action capability required by the play.
- Environment is explicit; sandbox credentials cannot deliver to production.

### 14.6 Model governance

- Provider-neutral typed contracts.
- Versioned prompt/model/Skill artifacts.
- Offline benchmark and shadow evidence.
- Cost, latency, grounding, policy, and fairness thresholds.
- Human review according to risk.
- Kill switch, rollback, and version-specific audit.

### 14.7 First real-bank onboarding contract

The first real-bank onboarding is one bounded non-production tenant, one
business line, one Growth Play, one sanctioned source contract, one employee
workflow destination, and one authoritative outcome return. It is not a bulk
enterprise rollout and does not require cross-business data.

The paid engagement has two phases. Paid readiness and integration begins with
a Gate 5 outcome-feasibility preflight before institution-specific workflow
customization, then completes Gates 1 through 5 and prepares Gate 6 shadow
proof. A paid sanctioned pilot begins only after all six gates, independent
approvals, assignment design, capacity, stop conditions, and analysis freeze
pass. This is a work-order decision, not a control bypass: no real assignment
or activation occurs out of sequence. Readiness claims stop at mechanism and
integration feasibility. Pilot claims remain descriptive and institution-
bounded unless an append-only approval authorizes the exact stronger wording,
method, audience, and limitations.

Onboarding follows six ordered gates:

1. **Institution boundary:** create the tenant, environments, data residency,
   support policy, retention policy, encryption ownership, and named business,
   risk, identity, data, workflow, and measurement owners.
2. **Identity and access:** connect the approved SAML/OIDC provider, map groups
   to canonical roles and business-line/queue scopes, define session and
   step-up rules, test joiner/mover/leaver behavior, and verify an access
   review. SCIM is required before production scale but may be manual for the
   bounded non-production pilot if the institution approves the process.
3. **Evidence source:** approve a field-level schema and purpose, tokenization
   boundary, subject-linkage method, freshness, consent, correction, retention,
   deletion, and source-receipt contract. Ventus receives only allowlisted
   fields and derived evidence needed by the play.
4. **Workflow destination:** configure the server-side connector, bank-owned
   customer resolution, object and field mapping, owner routing, allowed
   actions, deep link, error handling, and outcome-return identifiers. Pass a
   bounded sandbox write and reconciliation test.
5. **Outcome return:** register the authoritative event, source, subject
   linkage, explicit-zero behavior, correction semantics, delay, coverage,
   window, source version, reconciliation owner, and analysis freeze. Prove
   that the source owns the economic metric, or document the certified
   institution view and its lineage. Pass treatment and holdout contract
   fixtures before real assignments.
6. **Growth Play proof:** complete the Studio, register and independently
   approve the protocol, run qualified/suppressed/abstained/holdout cases in
   shadow, verify capacity, then authorize a bounded pilot population.

Each gate produces a durable, reviewable artifact:

| Gate | Required artifact |
| --- | --- |
| Institution | Tenant charter and named accountable owners |
| Identity | Signed role/scope mapping and access-test report |
| Evidence | Approved data contract, sample receipt, and retention decision |
| Workflow | Approved mapping version, health check, and external receipt |
| Outcome | Frozen metric and event contract with validation report |
| Growth Play | Immutable protocol, approvals, shadow report, and pilot change record |

The go/no-go review has three independent decisions:

- the Growth Play owner accepts the objective, action, capacity, and operating
  responsibility;
- the risk/model reviewer accepts policy, measurement, model evidence, and
  prohibited claims;
- the institution administrator accepts identity, data, connector, and
  environment configuration.

Ventus may provide templates and automated checks, but it cannot approve on
behalf of the institution. Failed or incomplete gates remain visible in
Connections, Growth Plays, or Governance and block the relevant deployment
transition.

For the first pilot, customer identity remains bank-owned. Ventus stores opaque
subject references and destination linkage receipts; it does not become the
customer master. Production onboarding additionally requires completed
security, privacy, legal, model-risk, incident, resilience, records-management,
SSO/SCIM, backup/recovery, and procurement gates.

## 15. Consumer Deposit Primacy Vertical Slice

### 15.1 Business contract

Objective: protect primary deposit relationships within Consumer Banking.

Primary metric: institution-defined `deposit_retained` observation over the
registered outcome window.

Authoritative source: the institution deposit ledger or an approved,
reconciled deposit-outcome view. Salesforce response and completion events are
operating evidence and do not determine `deposit_retained`.

Qualified moment: an approved combination of payroll anchoring and evidence of
relationship migration, evaluated under the institution's eligibility,
consent, vulnerability, and contact policies.

Default action: relationship-banker retention review delivered to the approved
Salesforce/FSC or banker-workbench destination.

The play must not depend on Merrill data or cross-business sharing.

### 15.2 End-to-end acceptance criteria

**Configuration**

- An owner can inspect the exact source, eligibility, policy, action,
  destination, capacity, holdout, and outcome contract.
- The protocol compiles to an immutable digest.
- A separate authorized reviewer can approve or revoke it.

**Evidence and decision**

- A sanctioned or explicitly labeled sandbox source produces a source receipt.
- The server returns qualified, suppressed, or abstained with protocol and
  runtime versions.
- A holdout subject is assigned before treatment decisioning and receives no
  treatment activation.
- No raw customer transaction data is required in the operator UI.

**Employee experience**

- A relationship banker starts on Today or a native deep link.
- The Moment Card explains what changed, why now, and the recommended review.
- The banker can accept, choose an approved alternative, defer, or decline.
- The product confirms where the action will land before delivery.

**Native execution**

- Delivery creates the institution-mapped Salesforce/FSC or workbench record.
- The record links to the bank-resolved customer Account when permitted.
- The native record includes a bounded decision mirror and Ventus deep link.
- The immutable delivery receipt contains external IDs and URLs.
- Repeating the same delivery does not create a duplicate.

**Measurement**

- Outcome events are accepted only from the registered source and within the
  window.
- Results display treatment, holdout, sample, coverage, and claim state.
- Business claims remain blocked until minimum sample and coverage gates pass.
- Causal claims remain blocked until the institution approves the method.

**Security and governance**

- Authentication, tenant membership, business-line scope, and entitlement are
  server-verified.
- Runtime database access uses a forced-RLS non-bypass role.
- Secrets remain server-side.
- Protocol, approval, assignment, response, delivery, and outcome evidence is
  durable.
- Evidence origin, measurement maturity, and claim authority are unmistakable
  and use the canonical labels in Section 3.

### 15.3 Completion evidence

The vertical slice is complete only when one evidence bundle contains:

- source receipt;
- immutable approved protocol;
- treatment and holdout assignments;
- qualified and holdout runtime traces;
- human response;
- real destination receipt;
- durable ledger head and verification;
- registered outcome observations for both arms;
- coverage and sample calculation;
- product screenshots for Today, Moment, native workflow, Results, and
  Governance;
- security and permission test results.

## 16. Merrill Reuse Contract

Merrill Qualified Wealth Growth reuses:

- the six-destination product structure;
- role and scope model;
- Growth Play compiler, registry, approvals, and lifecycle;
- Moment Card;
- Decision Package;
- Coworker;
- delivery reservation and receipts;
- outcome linkage and Results;
- Governance and Connections.

Merrill configures:

- wealth-specific approved sources and evidence;
- account or household subject scope;
- wealth eligibility, consent, suitability, and vulnerability policy;
- advisor, client-associate, or specialist owner roles;
- approved actions and FSC/CEW/Book360 mappings;
- capacity and routing;
- `net_new_assets` or another institution-approved primary metric;
- a longer outcome window where required.

The authoritative NNA source must be the institution wealth
books-and-records platform or a certified NNA view. CRM opportunity,
appointment, referral, and completion states remain operating observations and
cannot substitute for posted, qualified NNA.

Merrill must be provable with Merrill-controlled data and workflow. Consumer
Banking evidence is optional expansion, not a prerequisite.

No Merrill UI fork is permitted. Differences must be expressed through tenant,
business-line, Growth Play, role, vocabulary, and adapter configuration.

## 17. Assumptions Requiring BofA Validation

These are discovery questions, not product requirements:

### Employee systems and workflow

- Which system is the actual starting surface for Consumer relationship bankers?
- Which system is the actual starting surface for Merrill advisors and client
  associates?
- Is Salesforce FSC, CEW, Book360, another workbench, or a combination
  authoritative for assignment and completion?
- Which object types and record relationships are approved for a pilot?

### Identity and access

- Required SAML/OIDC provider, group claims, SCIM behavior, session length, and
  step-up authentication.
- Business-line and book-of-business scope source.
- Whether executives may inspect customer-level moments.

### Data and policy

- Approved evidence fields, freshness, retention, lineage, and correction
  process.
- Consent, contact, vulnerability, suitability, fair-lending, and suppression
  rules.
- Whether derived signals may cross Consumer and Merrill boundaries.
- Who owns each policy and approves changes.

### Action and capacity

- Approved action catalog and customer-contact language.
- Queue owners, capacity limits, service levels, escalation, and overflow.
- Whether Outlook or Slack notifications are permitted and what content is
  allowed.

### Measurement

- Authoritative definition of deposit retention and NNA.
- Outcome source, delay, correction, and coverage.
- Acceptable holdout design and contamination controls.
- Minimum evidence required for internal, pilot, and external claims.

### Brand and deployment

- White-label requirements and where Ventus attribution must remain visible.
- Hosting, network, encryption, key, logging, data-residency, and support model.
- Procurement, security, model-risk, privacy, legal, and records-management
  gates.

Until validated, the product uses configurable adapters and neutral vocabulary.
It must not hard-code named BofA systems as universal architecture.

### 17.1 Account strategy

BofA remains the strategic founding and anchor partner for enterprise control
requirements, Consumer Deposit Primacy, Merrill reuse, and long-horizon account
design. Ventus may execute the same bounded proof with a faster institution in
parallel to shorten evidence latency and test portability. The parallel account
uses a separate tenant, credentials, release manifest, approvals, evidence, and
claims. It does not receive a product fork or relaxed gate, and no result,
endorsement, or authority transfers between institutions.

## 18. Implementation Sequence

### Phase 0: Contract alignment

- Add `executive_viewer` and expose canonical roles/scopes to the frontend.
- Define Decision Package v1.2 as an additive contract.
- Define Growth Play operational-state records separate from immutable protocol.
- Add compatibility redirects for the target routes.
- Remove browser-authoritative role and tenant assumptions.

Exit: API and schema tests prove roles, scopes, package compatibility, and
tenant isolation.

### Phase 1: Consumer employee slice

- Build role-aware shell and Today.
- Extract one reusable Moment Card from the current Moments implementation.
- Keep raw transaction detail out of the production operator representation.
- Deliver the Consumer decision to Salesforce/FSC using the existing adapter.
- Display durable response and delivery receipts.

Exit: a relationship banker completes the canonical journey without visiting
Governance or Connections.

### Phase 2: Growth Play Studio

- Replace static play cards with portfolio and structured version detail.
- Add guided draft, readiness, immutable registration, review, and approval.
- Expose capacity, outcome, and evidence gaps.
- Keep AI drafting non-executable until validation and registration.

Exit: separate owner and reviewer can move a complete version to Shadow or Pilot
without editing JSON.

### Phase 3: Results and Governance

- Move Outcomes to Results and join registered measurement evidence.
- Join ledger, approvals, policy, model/Skill, and delivery reconciliation in
  Governance.
- Add role-specific executive aggregation.

Exit: every displayed result traces to protocol, assignment, delivery, and
outcome evidence.

### Phase 4: Connections and Coworker

- Consolidate setup and settings into Connections.
- Persist approved Salesforce mappings.
- Add Outlook first, then Slack, using the briefing delivery contract.
- Record notification receipts and engagement events.

Exit: an institution admin can test, approve, activate, rotate, and revoke each
adapter without exposing credentials to the browser.

### Phase 5: Merrill reuse

- Configure Merrill-specific sources, policy, action catalog, owner profiles,
  destination mappings, and NNA outcome.
- Reuse all product components and contracts.
- Add no cross-business dependency.

Exit: Consumer and Merrill run as separate governed programs on the same
platform, with optional future expansion explicitly permissioned.

## 19. Non-Goals for the First Implementation

- Replacing Salesforce or a bank employee workbench
- Building a generic conversational AI home screen
- Supporting every bank business line
- Automated cross-business data sharing
- Real-time self-optimizing production models
- Custom UI forks by institution
- Full campaign orchestration
- Production causal claims from sandbox data
- A proprietary customer identity master
- A broad data lake inside Ventus

## 20. Traceability to Current Assets

| Target capability | Current foundation | Required change |
| --- | --- | --- |
| Role-aware access | Cognito plus Aurora membership and RLS | Expose canonical roles/scopes; add executive viewer |
| Today | Briefings page and delivery contract | Role-driven priorities; rename and remove second-engine framing |
| Moments | Current Moments queue and responses | Extract Moment Card; use durable server state; hide raw demo data |
| Growth Plays | v1.0 compiler, registry, approval events | Structured studio, readiness, operational lifecycle |
| Results | Outcome methodology and evidence ladder | Durable cohort/coverage views and version-safe measurement |
| Governance | Hash ledger, protocol registry, approvals | Unified review and reconciliation surface |
| Connections | FSC onboarding and short-lived sessions | Persist mappings and approvals; add identity/outcome/channel adapters |
| Decision Package | v1.1 TypeScript contract | Additive v1.2 fields and representation adapters |
| Coworker | Console briefing and Outlook/Slack delivery contract | Channel administration, receipts, engagement, content minimization |
| Salesforce/FSC | Account verification, decision mirror, linked Task | Institution mapping, durable configuration, outcome return |
| AI | Provider-neutral gateway, deterministic active baseline | Typed Skill registry, shadow evaluation, promotion gates |
| Consumer slice | Deposit fixture, detector, policy, delivery | Sanctioned source, durable full loop, role experience, outcomes |
| Merrill reuse | Wealth fixture and Growth Play draft | Merrill-controlled source, policy, workflow, and NNA outcome |

### 20.1 Authoritative current-state references

Implementation must read these sources before replacing behavior:

| Concern | Current authority |
| --- | --- |
| Post-acceptance release, pilot, account, and next-cycle package decisions | `docs/architecture/sol-post-acceptance-decision-record.md` |
| Product goal and evidence limits | `docs/product-goal.md`, `docs/product-goal-evidence-matrix.md` |
| Runtime boundary | `docs/architecture/intelligence-control-plane.md` |
| Identity and roles | `docs/architecture/enterprise-identity-and-permissions.md`, `backend/sql/institution-access.sql` |
| Growth Play compilation | `backend/shared/growth-play-contract.mjs` |
| Protocols and approvals | `docs/growth-play-control-plane.md`, `backend/sql/growth-play-registry.sql` |
| Onboarding contract | `docs/growth-play-onboarding-contract.md` |
| Decision Package v1.1 | `src/lib/decisionPackage.ts`, `docs/decision-package-integration.md` |
| Console behavior | `src/console/state.tsx`, `src/console/ConsoleLayout.tsx` |
| FSC onboarding and delivery | `src/console/FscOnboardingPage.tsx`, `docs/fsc-enterprise-onboarding.md` |
| Delivery idempotency | `backend/sql/connector-delivery.sql` |
| Briefing delivery | `backend/shared/briefing-delivery.mjs`, `docs/briefing-delivery-foundation.md` |
| Outcome method | `docs/outcome-measurement-methodology.md`, `docs/pilot-operating-loop.md` |

Where this blueprint conflicts with demo copy, hard-coded scenario state, or
browser-only behavior, this blueprint controls the target implementation.
Existing evidence, security, and claims constraints remain authoritative unless
this document strengthens them.

## 21. Definition of Done

The enterprise redesign is coherent only when:

1. Each role enters a relevant start experience and cannot access unauthorized
   customer or administrative data.
2. The six destinations have distinct responsibilities and no duplicated
   decision logic.
3. One Decision Package renders consistently in Ventus, Salesforce, and
   Coworker.
4. One immutable Growth Play version governs evidence, policy, action,
   destination, assignment, and measurement.
5. The Consumer Deposit Primacy journey passes every criterion in Section 15
   with durable evidence.
6. The Merrill configuration reuses the same components and contracts without a
   UI fork or Consumer dependency.
7. Evidence origin, measurement maturity, and claim authority are accurately
   labeled as separate states; causal language is independently gated.
8. Tenant, role, business-line, connector, secret, and sensitive-data boundaries
   pass server-side tests.
9. AI is bounded by typed contracts, approved actions, deterministic controls,
   evaluation, and promotion gates.
10. All BofA-specific assumptions remain configuration or discovery items until
    verified.

This document is the product authority for the redesign. Implementation may
refine names and presentation, but any change to ownership, permissions,
protocol behavior, evidence claims, or integration boundaries requires an
explicit blueprint amendment.

## 22. Final Review Protocol

After implementation, an independent design-authority review must inspect the
running product and authoritative backend evidence. A code diff or green unit
test alone is insufficient.

The reviewer must:

1. Sign in as every canonical role and verify starting route, navigation,
   customer-level visibility, business-line scope, and denied operations.
2. Run the complete Consumer Deposit Primacy treatment and holdout paths from an
   approved source through a real sandbox destination and outcome return.
3. Verify that the same Decision Package renders consistently in Today,
   Moments, Salesforce/FSC, and Coworker without leaking prohibited data.
4. Inspect database roles, forced RLS, protocol and approval chronology,
   connector-session scope, secret handling, and delivery idempotency.
5. Reconcile every user-visible result and claim with source, assignment,
   response, delivery, outcome, coverage, and evidence-class records.
6. Confirm that model-assisted behavior is either shadow-only or supported by
   the required promotion evidence.
7. Configure the Merrill reuse case without a UI fork, Consumer dependency, or
   hard-coded BofA system assumption.
8. Compare all screens with Sections 4 through 8 and remove duplicated
   decision logic, passive dashboards, raw demo artifacts, and unnecessary
   technical explanation.
9. Identify every unverified production, security, integration, accuracy, or
   business-value claim.
10. Record findings by severity and approve only when all Definition of Done
    criteria have direct evidence.

Approval states:

- **Rejected:** a security, tenant, policy, evidence, or workflow invariant is
  violated.
- **Conditionally accepted for sandbox:** the governed sandbox journey is
  coherent but institution-specific production gates remain.
- **Accepted for pilot:** the sanctioned vertical slice and pilot controls have
  direct evidence.
- **Accepted for production:** all institution-specific production gates and
  controls have been independently approved.

### 22.1 Acceptance matrix

Every row requires a linked runtime artifact. A unit test or screenshot may
support a row but cannot replace the authoritative server receipt, database
record, or partner response when one exists.

| Control area | Conditionally accepted for sandbox | Accepted for sanctioned pilot | Reject when |
| --- | --- | --- | --- |
| Release identity and lineage | One secret-free manifest binds the exact frontend job/commit, API deployment, public configuration digest, identity target, data migrations, connector mappings, acceptance receipts, claims boundary, and independent reviewer | The same manifest binds the bank-review staging release and sanctioned configuration; every exception has an owner and disposition | A component, target, digest, receipt, or reviewer is unknown; a dev/staging mismatch is hidden rather than declared |
| Identity and session | All six canonical roles can authenticate; expired, invalid, and suspended sessions fail closed | Bank-approved IdP or explicitly approved non-production identity exception; session policy and owner recorded | An unauthenticated, invalid, or suspended subject can access protected data or mutate state |
| Role projection | Start routes, navigation, fields, and denied operations match Section 5 for every role | Bank role/group mapping and joiner/mover/leaver procedure are approved and tested | Endpoint access exposes prohibited customer, result, governance, or connector fields |
| Tenant, business-line, and queue isolation | Cross-tenant, cross-line, and unassigned-queue probes are denied server-side | Same probes pass using the bank's mappings and runtime database role | Any customer or administrative data crosses an unauthorized boundary |
| Growth Play separation of duties | Registrant cannot approve the same immutable version; a real change and approval chronology is retained | Named bank owner and independent reviewer approve the sanctioned protocol | Self-approval, mutable approved fields, or activation without the required approval succeeds |
| Skill governance | Skill remains draft or shadow; transitions are server-derived and every prediction has a typed receipt | Any model-assisted use is pinned to an approved Skill and separately approved Growth Play version | Browser-authored status or approval succeeds; a shadow Skill changes action, assignment, or delivery; fail-open behavior occurs |
| Source and provenance | Fixture and partner-sandbox inputs retain correct evidence labels and source receipts | Sanctioned source contract, allowed fields, freshness, retention, and correction handling are approved | Evidence origin is missing, upgraded, mislabeled, or cannot be traced to the decision |
| Assignment and holdout | Assignment precedes decisioning; holdout bypasses operator and destination surfaces | Unit, salt custody, holdout rate, exclusions, and sample plan are pre-registered | A holdout subject is surfaced, acted on, or delivered |
| Operator response | Allowed responses validate server-side and create immutable receipts | Bank-approved action catalog, reason codes, capacity, and service window are configured | An unapproved action, mutation, or destination can be selected or submitted |
| Delivery and reconciliation | One real partner-sandbox delivery returns a durable receipt; retries remain idempotent; ambiguous failures reconcile | Approved bank workflow mapping, owner, deep-link policy, and correction path are verified | Duplicate records are created, a false success is shown, or an ambiguous delivery cannot be reconciled |
| Outcome return | Outcomes for treatment and holdout can be ingested, corrected, and joined without altering history | Authoritative source, explicit-zero rule, timing, parity, corrections, and reconciliation owner are approved | Missing-arm bias is hidden, corrections overwrite history, or an outcome cannot be traced to assignment |
| Results and claims | Counts and mechanism status reconcile; fixture or sandbox results remain non-business claims | Coverage, sample, integrity, method, and reviewer gates produce the exact claim status in Section 3 | A claim exceeds its evidence class, measurement maturity, approved wording, or scope |
| Decision Package consistency | The same digest and bounded fields appear in Ventus, FSC, and enabled Coworker surfaces | Bank-approved field and redaction mappings preserve that identity across live pilot surfaces | Surfaces disagree about subject, action, evidence, policy, assignment, or protocol version |
| RLS and secrets | Runtime role cannot bypass forced RLS; secret values never reach browser, logs, receipts, or model prompts | Bank tenant, runtime roles, key ownership, rotation, and support-access controls are verified | RLS bypass, plaintext secret exposure, or unauthorized cross-tenant support access is possible |
| Merrill and institutional reuse | Merrill configuration uses the same contracts without a UI fork, Consumer dependency, or BofA-coded runtime logic | A second approved configuration maps its own source, action, outcome, and policy contracts | Business-line behavior requires a product fork or silently relies on another line's data |
| UX, resilience, and accessibility | Role journeys, empty/error states, responsive layouts, and presenter regression pass; failures are honest and recoverable | Bank service levels, observability, incident path, accessibility target, and support owner are approved | The UI implies success after failure, hides a blocked control, leaks technical internals, or prevents the assigned job |

### 22.2 Decision rules

- A single rejection condition in security, tenant isolation, policy,
  separation of duties, evidence integrity, holdout integrity, or claims makes
  the overall decision **Rejected**.
- **Conditionally accepted for sandbox** requires every sandbox cell above to
  pass. Fixture outcomes are permitted only when labeled at the artifact and
  bundle level; they cannot support a business-value claim.
- **Accepted for pilot** requires every sanctioned-pilot cell to pass, a
  complete Section 15.3 evidence bundle, and the six onboarding gates in
  Section 14.7 to be approved by their named owners.
- **Accepted for production** additionally requires institution-specific
  procurement, security, resilience, support, data-residency, identity,
  monitoring, and incident controls. Sandbox or pilot acceptance never implies
  production readiness.
- Employee response rate, holdout rate, minimum sample, coverage, outcome
  window, confidence method, service level, capacity, model quality delta,
  repeat count, shadow volume/duration, latency, and cost thresholds are
  accepted only when pre-registered for the institution and task. Current
  numeric defaults are calibration proposals, not universal product gates.
  Zero tenant, authorization, consent, policy, holdout, secret,
  business-line, fabricated-evidence, or out-of-catalog-action violations
  remain hard controls.
