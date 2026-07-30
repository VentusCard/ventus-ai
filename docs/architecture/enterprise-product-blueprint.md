# Ventus AI Enterprise Product Blueprint

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

The frontend may render and collect responses. It must not authoritatively
calculate eligibility, policy clearance, experiment assignment, or lift.

## 3. Evidence Boundary

The product must distinguish four states without visual ambiguity:

| State | Meaning | Allowed claim |
| --- | --- | --- |
| Fixture | Ventus-authored test records | Interaction and contract demonstration only |
| Partner sandbox | Live call to a partner sandbox with synthetic records | Connector and mechanism demonstration |
| Sanctioned pilot | Institution-approved data and workflow | Operational evidence, subject to approved scope |
| Measured | Registered outcome coverage and statistical gates passed | Measured result with method and limitations |

Current evidence proves fixture and partner-sandbox operating loops, a live
Salesforce sandbox write, tenant-scoped identity and persistence primitives, and
the decision-package boundary. It does not prove production bank integration,
customer impact, causal lift, bank SSO, SCIM, or certification.

The UI must display the evidence class at the receipt or result level. It should
not repeat technical disclaimers on every working screen.

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

| Capability | Operator | Play owner | Risk | Institution admin | Executive |
| --- | --- | --- | --- | --- | --- |
| Read assigned customer moments | Yes | Optional by scope | Audit basis | No by default | No by default |
| Respond to allowed action | Yes | No by default | No | No | No |
| Draft a Growth Play version | No | Yes | No | No | No |
| Register a version | No | Yes | No | No | No |
| Approve business behavior | No | Separate owner subject if allowed | Yes when policy/model review is required | No | No |
| Approve connector mapping | No | No | Inspect | Yes | No |
| View aggregate results | Scoped | Yes | Yes | Health only | Yes |
| View decision evidence | Assigned only | Aggregate and sampled by policy | Yes | Connector diagnostics only | Aggregate only |
| Manage membership and SSO | No | No | No | Yes | No |

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
must be additive and introduced as v1.2; existing consumers must continue to
parse v1.1.

### 9.1 Required v1.2 additions

```ts
type DecisionPackageV12 = Omit<
  DecisionPackageV11,
  "schemaVersion" | "subject" | "moment" | "recommendation" |
  "governance" | "workflow" | "outcome"
> & {
  schemaVersion: "1.2";
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
  governance: {
    policyStatus: "cleared" | "suppressed" | "review";
    controls: string[];
    humanReviewRequired: boolean;
    assignmentArm: "treatment" | "holdout";
    protocolApprovalId: string;
    exceptionStatus: "none" | "open" | "resolved";
  };
  workflow: {
    connector: string;
    destination: string;
    ownerRole: string;
    ownerToken?: string;
    dueAt?: string;
    status: "ready" | "reserved" | "delivered" | "failed" | "reconciled";
    deliveryId?: string;
    records?: Record<string, string>;
  };
  outcome: {
    metric: string;
    windowDays: number;
    status: "not-opened" | "measuring" | "measured";
    coverageStatus: "pending" | "insufficient" | "passed";
    claimStatus: "blocked" | "observational" | "measured";
    observation?: DecisionOutcomeObservation;
  };
};
```

### 9.2 Invariants

- `tenantId`, `decisionId`, `growthPlay.protocolId`, and subject token are
  immutable.
- The package references source receipts; it does not replace the evidence
  ledger.
- Recommended and alternative actions come from the approved action catalog.
- Holdout packages cannot be delivered as treatment actions.
- A delivery receipt is idempotent per approved action and destination.
- Human response identity is server-verified.
- Outcome observations cannot predate assignment or fall outside the registered
  window.
- Destination-specific objects never become the canonical Ventus schema.

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
- institution-approved outcome or relationship events.

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

## 15. Consumer Deposit Primacy Vertical Slice

### 15.1 Business contract

Objective: protect primary deposit relationships within Consumer Banking.

Primary metric: institution-defined `deposit_retained` observation over the
registered outcome window.

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
- Sandbox, sanctioned, and measured states are unmistakable.

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
7. Sandbox, sanctioned, measured, observational, and causal states are
   accurately labeled.
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
