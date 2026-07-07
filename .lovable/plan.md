Rewrite `EVENT_OFFER` in `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` so every "Recommended offer" line names specific products that exist in the Bank Context catalog (`src/lib/bankProductCatalog.ts`, surfaced in the Bank Context tab).

## Findings
- The digest's event types come from `DetectedLifeEvent['eventType']`: `retirement | education | home_purchase | wealth_transfer | business_liquidity | family_formation | elder_care`.
- Current `EVENT_OFFER` uses two keys that never fire (`college_prep`, `new_child`) and generic phrases ("Household planning check-in", "Care-cost planning").
- Bank Context products available today include: Merrill Guided Investing with Advisor, Merrill Lynch Wealth Management, Traditional / Roth / Rollover IRA, 529 College Savings Plan, Custodial UGMA / UTMA, Fixed-Rate / Jumbo / Affordable mortgages, HELOC, Preferred Rewards Program, Advantage Relationship Banking, Featured / Fixed / Flexible CD, Advantage Savings, Trust Services, Estate Planning Services, Philanthropic Solutions, Specialty Asset Management, Family Office Services, Private Bank, SBA Loans, Business Line of Credit, Practice Solutions, Balance Assist, Overdraft Protection.

## Change (single edit)

Replace the `EVENT_OFFER` map and its keys to match the real event types and to name catalog products verbatim:

- `retirement` → "Rollover IRA + Merrill Guided Investing with Advisor; review Preferred Rewards tier"
- `education` → "529 College Savings Plan top-up; Custodial UGMA/UTMA for flexible funds"
- `home_purchase` → "Jumbo Mortgage or Affordable Loan Solution pre-qual; HELOC on current home for bridge"
- `wealth_transfer` → "Trust Services + Estate Planning Services; Philanthropic Solutions for legacy gifts"
- `business_liquidity` → "Fixed-Term CD ladder + Advantage Savings for parking; Merrill Lynch Wealth Management for deployment"
- `family_formation` → "529 College Savings Plan open; Advantage Relationship Banking bundle"
- `elder_care` → "Trust Services checkpoint + Specialty Asset Management; Preferred Rewards tier review"
- fallback → "Preferred Rewards tier review + Merrill Guided Investing with Advisor intro"

`offerFor()` stays as-is; only the map contents change.

## Out of scope
- Bank Context tab content itself, product catalog data, event-type taxonomy.
- Later Advisor conversation messages, Leadership demo, Coworker Inbox threads.
