# Salesforce FSC adapter

Ventus owns the canonical Decision Package and outcome ledger. Salesforce
receives a bounded mirror so bankers can act in their existing workspace.

The adapter supports three records:

1. `Ventus_Decision__c` stores the governed Decision Package receipt.
2. An FSC Lead using the institution's Referral record type routes the opportunity.
3. A standard Task gives the assigned employee a clear next action.

`Ventus_Decision__c` also provides a bounded outcome-return surface. A bank
workflow or authorized sandbox user may set:

- `Human_Response__c`
- `Outcome_Status__c`
- `Outcome_Event_Type__c`
- `Outcome_Metric__c`
- `Outcome_Amount__c`
- `Outcome_Occurred_At__c`
- `Outcome_Source_Record_Id__c`
- `Outcome_Reason_Code__c`

The Ventus connector reads only the linked Decision Receipt by Salesforce ID.
It does not accept arbitrary SOQL, copy direct PII, or convert one observed
event into a lift claim. The Console labels the event observed until the
separate experiment service has sufficient treatment and holdout coverage.

Deploy `force-app`, assign the `Ventus Decision Connector` permission set to the
Connected App run-as user, then set `SF_VENTUS_DECISION_ENABLED=true`. If the
custom object is absent or unavailable, the connector still delivers the
Referral and Task and returns a warning.
