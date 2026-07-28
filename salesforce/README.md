# Salesforce FSC adapter

Ventus owns the canonical Decision Package and outcome ledger. Salesforce
receives a bounded mirror so bankers can act in their existing workspace.

The adapter supports three records:

1. `Ventus_Decision__c` stores the governed Decision Package receipt.
2. An FSC Lead using the institution's Referral record type routes the opportunity.
3. A standard Task gives the assigned employee a clear next action.

Deploy `force-app`, assign the `Ventus Decision Connector` permission set to the
Connected App run-as user, then set `SF_VENTUS_DECISION_ENABLED=true`. If the
custom object is absent or unavailable, the connector still delivers the
Referral and Task and returns a warning.
