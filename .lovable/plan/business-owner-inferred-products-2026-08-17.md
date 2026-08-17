# Business-Owner Inferred Products

When the signal set indicates a customer is a business owner or self-employed (payment-processor deposits, payroll-provider ACH debits, supplier and B2B software payments, quarterly estimated-tax payments, commercial insurance and lease payments), a distinct set of products becomes relevant. The Automated Flows catalog currently covers this with only two flows: Small Business Loan and Business Credit Card.

## What gets added

New flows in `src/lib/productAutomatedFlows.ts`, placed in the existing five categories (no new category):

Lending
- SBA 7(a) / 504 Loan — expansion, equipment, or owner-occupied property financing
- Business Line of Credit — working-capital smoothing for seasonal receipts
- Equipment Financing — recurring equipment rental/repair spend suggests buy-vs-lease
- Commercial Real Estate Mortgage — business rent payments to a landlord entity

Deposits
- Business Checking — processor settlements landing in a personal DDA
- Business Savings / Sweep — idle balances above operating need
- Merchant Services / Payment Acceptance — outbound fees to third-party processors

Cards
- Corporate / Purchasing Card — multi-user supplier spend on a consumer card
- Fuel & Fleet Card — recurring fuel and vehicle maintenance spend

Wealth
- Solo 401(k) / SEP-IRA — self-employment income with no employer retirement deposits
- Business Succession & Exit Planning — mature owner, high retained balances
- Payroll Services — payroll-provider debits to a competitor

Insurance
- Business Owner's Policy (BOP) — commercial insurance premiums to an outside carrier
- Workers' Compensation — payroll present, no comp premium observed
- Key Person Life Insurance — owner-dependent revenue concentration

## Signals used

Each flow carries 3 signals in the existing `{ label, evidence, type }` shape, drawn from owner-detection evidence: card-processor settlement credits (Square/Stripe/Toast style descriptors), payroll-provider ACH debits, IRS estimated-tax quarterly payments, wholesale/supplier ACH, B2B SaaS subscriptions, commercial lease and utility payments, and business insurance premiums. Types split between `behavioral` and `life-event` (e.g. first payroll run, business sale).

## Technical notes

- Single file change: `src/lib/productAutomatedFlows.ts` — append entries plus any missing lucide icon imports.
- `estimatedAudience` and `penetration` sized to the SMB slice of the ~250M base (roughly 2-9M per flow, far below consumer flows) so the audience-descending "All" ranking still puts consumer products on top.
- Views are data-driven; category chips and counts update automatically. No component changes.
