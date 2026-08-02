# Ventus Decision Package integration

## Product boundary

Ventus is the decision and accountability layer. It owns enrichment, financial
state detection, Growth Play qualification, policy checks, operator responses,
experiments, the decision ledger, and outcome learning.

The bank's systems remain the systems of record and work:

- Data platforms provide sanctioned, tokenized evidence.
- Ventus produces a versioned Decision Package.
- CRM, banker workbenches, journey tools, or webhooks receive a bounded action.
- Bank outcome feeds return what happened.

No destination-specific object model is allowed to become the canonical Ventus
decision model.

## Version 1.1 contract

`src/lib/decisionPackage.ts` defines the portable contract:

- Growth Play: business line, objective, metric, and protocol.
- Subject: an opaque customer or household token.
- Moment: summary, confidence, and bounded supporting evidence.
- Recommendation: one selected action and an approved alternative catalog.
- Governance: policy status, controls, treatment assignment, and human review.
- Decision method: the active method and any shadow model candidate.
- Human response: accepted, modified, deferred, or declined.
- Workflow: connector status and downstream record receipts.
- Outcome: registered metric, window, measurement status, and an optional
  provider-neutral observation receipt.

Raw transactions, model credentials, and customer PII are not included.

## Salesforce FSC adapter

The current adapter maps the same Decision Package into:

1. A `Ventus_Decision__c` mirror for explainability and lineage.
2. An FSC Lead using the institution's Referral record type.
3. A linked Task for the employee's next action.

The custom object is optional. If it has not been deployed, Referral and Task
delivery still complete and the connector returns a warning. The Ventus ledger
remains canonical either way.

The FSC return adapter reads one linked `Ventus_Decision__c` record by ID and
maps its structured response, completion, timing, reason, and reconciliation
fields into treatment workflow evidence. The read session is separately scoped
from Salesforce delivery. Holdout creates no FSC treatment record. A workflow
observation closes the operating loop but never satisfies the primary P&L
metric or unlocks a business or causal claim. A bank-owned ledger,
books-and-records system, or certified outcome view must return the registered
economic observation for both treatment and holdout before the experiment
service can measure the result.

## Adding another institution or destination

A new integration should map the stable Decision Package, not reimplement the
Growth Play:

1. Configure the institution's source mappings, business vocabulary, policies,
   action catalog, and outcome definitions.
2. Implement a thin adapter for the destination's native records or webhook.
3. Return immutable destination receipts into the Ventus ledger.
4. Validate tenant isolation, permissions, idempotency, and outcome coverage.

This keeps the product institution-neutral while allowing each deployment to
feel native inside the bank's existing stack.
