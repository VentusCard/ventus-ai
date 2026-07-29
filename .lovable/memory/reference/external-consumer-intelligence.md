---
name: External Consumer Intelligence
description: Third-party enrichment source catalog — 8 sources, 175+ attributes, 300M+ consumers / 125M+ households; use to augment first-party signals
type: reference
---

Third-party consumer intelligence dataset used to enrich first-party transaction signals with household, demographic, and lifestyle attributes.

**Naming rule:** always refer to this in code, UI, and copy as **"External Consumer Intelligence"** or **"third-party enrichment."** Never name the underlying vendor in customer-facing surfaces (aligns with the infrastructure-abstraction rule).

## Scale
- 300M+ US consumers
- 125M+ primary US households
- 11M+ Canadian consumers

## Sources (8)
- Real Estate — Tax Assessments & Deed Transfers
- US Census
- Voter Registration
- Credit Card Transactions
- Registrations & Subscriptions
- Bankruptcy filings
- Telephone White Pages
- License & Registration Data (pilot, hunting, boat, driver's license historical)

## Attribute categories (175+ total attributes)
- **Contact & Identity** — name, address, phone, email
- **Home / Real Estate** — owner/renter, home value, length of residence, mortgage info, year home built, property details
- **Person & Family** — age, DOB, children, marital status, gender, vehicle information, political party, ethnicity
- **Financial / Wealth** — income, credit card info, net worth, disposable income
- **Interests / Behaviors** — hobbies, estimated behaviors (shopping, travel, leisure)

## Dataset tiers
- **Individual** — person-level demographics, DOB, head-of-household indicator, marital status, spouse indicator, ethnicity
- **Household** — unique household ID, phone numbers, income, dwelling size, location type, presence of adults/children, age of HoH, home value, lifestyle data
- **Neighborhood** — Census info (700+ statistics), age, household composition, education, employment, income, race/ethnicity, socio-economic status indicators, community dimensions

## Signal families this can enrich
- **Demographic** (primary): age band, income band, region, homeowner status, household composition
- **Life Event**: new mover / new homeowner / pre-mover flags
- **Financial**: income band, net worth tier, disposable income
- **Behavioral**: interest clusters (travel, shopping, leisure)

## Usage
Reference layer only — join by household/individual ID or address to first-party transaction data to fill gaps where behavior-inferred signals are thin (e.g., new customers with limited transaction history).
