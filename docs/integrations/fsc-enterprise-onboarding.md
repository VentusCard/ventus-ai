# Salesforce FSC enterprise onboarding

This slice proves that Ventus can enter a new Salesforce Financial Services Cloud
sandbox without turning Salesforce into Ventus's system of record.

## Administrator journey

1. Start a short-lived connector session. Salesforce credentials remain server-side.
2. Discover the bounded FSC schema Ventus supports. The endpoint checks only the
   approved objects and fields required for customer linkage, employee delivery, a
   decision receipt, and outcome return.
3. Verify one explicit sandbox Account ID. Ventus returns relationship flags only;
   customer names and profile fields are not copied into the browser.
4. Create one governed proof. The same delivery adapter used by Growth Plays writes
   an Account-linked Task and a `Ventus_Decision__c` receipt. It does not create a
   generic Lead for this proof.

## Ownership boundary

- Ventus remains the canonical system for signal evidence, decision policy, human
  response, experiment assignment, and the decision-outcome graph.
- Salesforce remains the employee workflow and customer relationship surface.
- Salesforce receives a bounded decision mirror and returns workflow outcomes.
- Bank administrators control schema onboarding. Operators do not receive schema
  discovery permission.

## Demonstrated versus remaining

Demonstrated in code and tests:

- role-scoped schema discovery
- server-side Salesforce OAuth
- required-field readiness checks that fail closed
- privacy-minimized Account verification
- customer-linked Task and Decision Receipt delivery

Still required for a production institution:

- bank SSO and SCIM provisioning
- bank-approved Salesforce app installation and permission sets
- institution-specific object and record-type mapping
- persistent onboarding configuration and change approval
- security, privacy, retention, and procurement review
- sanctioned outcome feeds and statistically valid lift measurement
