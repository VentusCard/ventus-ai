## Goal

Record the third-party consumer intelligence dataset (from the uploaded Data Axle reference slides) as a project memory entry so future work can cite its sources, attributes, and scale — without touching any UI.

Per the naming choice, the vendor is abstracted as **"External Consumer Intelligence"** in all copy (aligns with the existing infrastructure-abstraction rule).

## Changes

### 1. New memory file: `mem://reference/external-consumer-intelligence`

Type: `reference`. Captures:

- **Purpose**: third-party enrichment layer that can augment first-party transaction signals with household, demographic, and lifestyle attributes.
- **Sources** (8): Real Estate — Tax Assessments & Deed Transfers · US Census · Voter Registration · Credit Card Transactions · Registrations & Subscriptions · Bankruptcy · Telephone White Pages · License & Registration Data (pilot, hunting, boat, etc.).
- **Attribute categories** (6):
  - Contact & Identity — name, address, phone, email
  - Home / Real Estate — owner/renter, home value, length of residence, mortgage info, year built, property details
  - Person & Family — age, DOB, children, marital status, gender, vehicle, political party, ethnicity
  - Financial / Wealth — income, credit card info, net worth, disposable income
  - Interests / Behaviors — hobbies, estimated shopping/travel/leisure behaviors
  - Plus 175+ total consumer attributes
- **Dataset tiers**: Individual (person-level demographics, DOB, HoH indicator, marital status, spouse, ethnicity) · Household (unique household ID, phone, income, dwelling size, location type, adults/children, age of HoH, home value, lifestyle) · Neighborhood (Census: 700+ stats, age, composition, education, employment, income, race/ethnicity, SES indicators, community dimensions).
- **Scale**: 300M+ US consumers · 125M+ primary US households · 11M+ Canadian consumers.
- **Signal families it can enrich**: Demographic (primary), Life Event (new mover / new homeowner / pre-mover), Financial (income band, net worth tier), Behavioral (interest clusters).
- **Usage rule**: reference only — do not name the vendor in customer-facing copy; always refer to it as "External Consumer Intelligence" or "third-party enrichment."

### 2. Update `mem://index.md`

Add one line under `## Memories`:

```
- [External Consumer Intelligence](mem://reference/external-consumer-intelligence) — Third-party enrichment source: 8 sources, 175+ attributes, 300M+ consumers / 125M+ households
```

## Not in scope

- No changes to `CapabilitiesView.tsx` or any other UI file.
- No new SourceGroup rendered on `/bankdemo`.
- Vendor name (Data Axle) is not written into any code or user-facing memory field.
