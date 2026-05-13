# Anonymize KYC fields in /demo

In `src/components/exec-demo/ExecDemoSelectionDialog.tsx`, keep all existing KYC fields but replace PII values with `"-"`.

## Changes

**File:** `src/components/exec-demo/ExecDemoSelectionDialog.tsx` (KYC grid, lines ~298–328)

1. **Collapsed header** — replace `customer.profile.compliance.kycStatus` next to the KYC pill so it does not show the customer name (already shows kycStatus, leave as-is).

2. **Expanded grid** — keep all 16 rows in the same order, replace these values with the literal string `"-"`:
   - Name
   - Email
   - Phone
   - Address → replace full street/city with `"-"`, but display the trailing **zip code** extracted from the address (regex `/\b\d{5}\b/`) appended as `"- (zip 94110)"`. If no zip is present, just `"-"`.

3. **Keep unchanged** (non-PII): Segment, AUM, Tenure, Age, Occupation, Industry, Family Status, Income Level, KYC Status, Last Review, Next Review, Risk Profile.

No other files or logic touched. Underlying `customer.profile` data is unchanged so downstream edge functions still receive whatever they receive today.
