Make the 9:22 / 9:23 exchange substantive in the WM Coworker Advisor demo — grounded strictly in transactions we can actually observe.

## Change

In `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx`:

### 1. 9:22 Advisor (Morgan)
Direct evidence request: "Before I reach out, give me the supporting evidence on both. For each: which transactions triggered this, and what do we know about the household?" Keep the two named bullets (nameA, nameB).

### 2. 9:23 Ventus (Coworker)
Per client show:
- Event label
- **Transactions (last 90 days):** a 3–5 item bulleted list of concrete, observable charges/credits/debits indicative of the life event. Merchant category + rough cadence only, no dollar amounts, no intent inferred.
- **Household:** one short line of what we know (e.g., "joint account with spouse, two dependents on file").

No speculative insight line. We only surface what shows up on the ledger.

Add an `EVIDENCE: Record<eventType, { transactions: string[]; household: string }>` map:

- retirement → txns: recurring pickleball club dues; Viking / Princess cruise deposits; national-park lodge bookings; Medigap premium debits; two large IRA-adjacent transfers in. Household: 30-yr tenure, mortgage nearly paid, spouse on joint account.
- wealth_transfer → txns: recurring debit to an estate-planning law firm; residential real-estate appraisal fee; safe-deposit-box annual renewal; wire out to a title company; charitable-gift-fund contribution. Household: three adult children on statements, primary POA not yet on file.
- business_liquidity → txns: retainer to a business-brokerage firm; monthly CPA advisory debit; escrow-adjacent inflow last week; recurring commercial-insurance premium; charter-flight charge. Household: business owner, spouse on business payroll.
- home_purchase → txns: home-inspection service charge; two moving-quote deposits; Zillow Premier subscription; storage-unit rental started; earnest-money-adjacent debit. Household: renter locally, one child entering school next fall.
- education → txns: SAT/ACT prep provider; admissions-consultant retainer; college-tour airfare to Boston and Providence same weekend; campus-bookstore charge; Common App fee. Household: high-school junior at home, dual-income.
- family_formation → txns: obstetrics copays every 4 weeks; nursery-furniture retailer; prenatal-class provider; maternity-apparel spend; baby-registry retailer activity. Household: married, no dependents yet on file.
- elder_care → txns: in-home-care agency debit; geriatric-care-manager retainer; medical-equipment supplier; memory-care assessment center; pharmacy spend up sharply. Household: parent recently widowed, POA not yet on file.
- fallback → txns: broad shift in category mix over the last 60 days; new recurring debits started; balance drift across accounts. Household: standard profile on file.

### 3. Helper
Add `EVIDENCE` and `evidenceFor(eventType)` next to `EVENT_OFFER` / `offerFor`.

## Constraints observed
- Only observable spend/credit/debit lines. No inferred plans, trips, or intent language.
- No exact dollar amounts or transaction counts (vaguely specific tone).
- No competitor brand names beyond acceptable public merchants (Zillow, Viking, Princess, Common App).
- No em dashes in AI copy.

## Out of scope
- Messages 3–7 (9:44 onward), Leadership demo, Coworker Inbox threads.
- Bank Context catalog, `EVENT_OFFER`, event-type taxonomy.
- Wiring evidence to real client profile fields — hand-authored per event type is enough for this pass.
