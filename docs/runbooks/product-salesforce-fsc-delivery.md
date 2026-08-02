# Product Salesforce/FSC Delivery Runbook

Purpose: configure the authenticated Growth Console to create a governed
Salesforce/FSC workflow record from an approved Ventus Moment.

This is a product connector. It is intentionally separate from
`ventus/staging/demo-connectors`, which remains presentation-only.

## Preconditions

1. Deploy the Console API stack so AWS creates
   `ventus/staging/product-connectors` and grants only `ventus-console-api`
   read access.
2. Confirm the Console Lambda's private subnets have egress to the Salesforce
   login and instance domains through the institution-approved network path.
3. Create a Salesforce Connected App with client-credentials OAuth permitted
   for the sandbox integration user. Do not use an employee password or a
   browser session token.
4. Verify that the Console user has an active Aurora membership, the
   `growth_console` and business-line entitlement, and the `bank_operator`
   role before attempting a delivery.

## Secret Shape

Replace the placeholders in `ventus/staging/product-connectors`; do not add
these fields to the demo secret.

```json
{
  "salesforceLoginUrl": "https://<my-domain>.my.salesforce.com",
  "salesforceClientId": "<connected-app-client-id>",
  "salesforceClientSecret": "<connected-app-client-secret>",
  "salesforceDefaultAccountId": "",
  "salesforceReferralRecordTypeId": "",
  "salesforceCreateReferral": false
}
```

`salesforceDefaultAccountId` and `salesforceReferralRecordTypeId` are optional
for a non-production FSC referral proof. Keep both blank and leave referrals
off until a bank-approved, server-side customer identity mapping exists. The
standard Task and, where installed, the Ventus Decision Receipt still provide
the governed workflow proof without those values.

## Expected Product Flow

1. An authorized operator reviews and accepts or modifies the one permitted
   action inside a Moment.
2. The Console API writes the response and an idempotent delivery reservation
   to Aurora.
3. The Console Lambda retrieves the product-only secret and sends the
   server-prepared Decision Package to Salesforce/FSC.
4. The service writes a Task, attempts the optional Ventus Decision Receipt,
   and records bounded external links in the immutable activation trail.
5. The Moment changes to **Delivered** only after a receipt is written. A
   configuration error is shown as failed. A timeout or ambiguous Salesforce
   response stays reserved for reconciliation so Ventus never creates a false
   success or retries a potentially accepted write.

## Verification

Use a new authorized test Moment rather than replaying an existing delivery.
Confirm that the Console shows an employee-task link, then open the Salesforce
record and verify it contains the decision reference, recommended action,
bounded supporting signals, policy controls, and source reference. It must not
contain raw transaction data or a browser-provided customer relationship ID.
