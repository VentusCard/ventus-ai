## Mirror SAMPLE_CSV's signal richness across the other five datasets

The "Wellness Explorer / SF" dataset (`SAMPLE_CSV`) is uniquely rich: it interleaves recurring rhythms (CHEWY monthly, SF Tennis renewals, Vail ski pass), one-off life events across non-card rails (SAT registration → Kaplan → admissions consulting via Checks; mortgage app → home inspection → title escrow via Checks; down-payment Wire; Zelle to dog-sitter and contractor), and risk/vice signals (DraftKings, Stake.com, EarnIn payday advance, Bellagio Casino, Western Union, Portfolio Recovery collections). The other five CSVs are essentially flat card-and-Checking activity.

This plan injects the same pattern — **recurring + non-recurring behavioral signals + life events + risk indicators across multiple payment rails** — into each of the other five sample sets, tuned to that customer's persona.

### Signal categories to inject per dataset

Each dataset gets ~12–18 new rows total spread across the date range, in four buckets:

1. **Recurring behavioral rhythm** (1–3 rows) — a sticky monthly habit not yet visible (e.g. subscription, gym, music lessons), often on the lowest-friction rail (ACH or Cashback Card).
2. **Life-event progression** (3–6 rows) — a multi-step arc spanning ≥2 quarters using Checks/ACH/Wire, ending in a major outflow. The arc must match the persona's `lifeEvents` declared in `demoData.ts`.
3. **Risk / vulnerability indicator** (1–3 rows) — gambling, payday advance, collections, BNPL, crypto, or unusual wire — on a deliberately mixed rail (Premium Card for gambling, Checks for collections, Cashback for cash-advance apps).
4. **Cross-rail diversity** (1–2 rows) — a Zelle to a person and at least one Wire or HSA where it makes sense, so each dataset shows ≥4 distinct sources.

### Per-dataset injections

#### `SAMPLE_CSV_SPORTS_WELLNESS` — Austin "Wellness Explorer", lifeEvents: Home Purchase + Family Formation
Already has 2 HSA + a Buy Buy Baby + Pottery Barn Kids + OB-GYN + Chiropractic.
Add:
- **Recurring**: PELOTON ALL-ACCESS monthly (ACH, $44, x3 dates), MINDBODY YOGA APP subscription (Cashback, $19, x2).
- **Life event — Home Purchase**: AUSTIN MORTGAGE BROKERS app fee (Checks, $450, Mar 2025) → AUSTIN HOME INSPECT (Checks, $575, Apr 2025) → STEWART TITLE TX (Checks, $1,650, May 2025) → DOWN PAYMENT TRANSFER (Wire, $62,000, May 2025).
- **Life event — Family Formation**: AUSTIN OB GYN follow-up (HSA, already there) → BABYLIST REGISTRY (Cashback, $89) → CORD BLOOD REGISTRY (Checks, $1,495) → MATERNITY NURSE (Zelle, "Doula deposit", $1,200).
- **Risk**: DRAFTKINGS SPORTSBOOK TX deposit (Premium Card, $200) → AFFIRM*PELOTON BNPL (Cashback, $58/mo x2).
- **Cross-rail**: Zelle to "JAMES K" labeled "Personal trainer" $400.

#### `SAMPLE_CSV_FOOD_HOME` — Chicago "Family Planner", lifeEvents: Wealth Transfer + Elder Care
Already has Guaranteed Rate mortgage fee + Chicago Title escrow on Checking.
Reclassify those two to **Checks** for consistency, then add:
- **Recurring**: PEAPOD GROCERY DELIVERY weekly (ACH, $145 x4), MUSIC TOGETHER kids' class (ACH, $185/mo x3).
- **Life event — Elder Care arc**: SUNRISE SENIOR LIVING tour deposit (Checks, $250, Jun 2025) → AARP MEDICARE SUPPLEMENT (Checks, $189, Jul) → IN-HOME CARE CHICAGO (Zelle, "Caregiver weekly", $850 x2 in Aug/Sep) → MEDICAL EQUIPMENT CO (HSA, $445).
- **Life event — Wealth Transfer**: NORTHWESTERN TRUST CONSULT (Checks, $1,200, Sep) → ESTATE ATTORNEY RETAINER (Wire, $7,500, Oct) → CHARITABLE GIFT FUND (ACH, $5,000, Oct).
- **Risk**: PORTFOLIO RECOVERY ASSOC past-due collections (Checks, $415, May), KLARNA*WAYFAIR BNPL installment (Cashback, $112 x3).
- **Cross-rail**: Zelle to "MARGARET S" "Mom's grocery help" $300.

#### `SAMPLE_CSV_TRAVEL_FAMILY_12` — SF "Golf & Leisure", lifeEvents: Retirement Planning + Estate Planning
Loaded with after-school care, parking garage, summer camp on Checking — already shows recurring family ops. The dataset already hints at Princeton Review (ACT prep), UC Berkeley parking, Del Webb retirement community, estate attorney, Keller Williams realty (all on Checking). Add:
- **Recurring**: GOLF CLUB DUES monthly (ACH, $385 x4), WSJ DIGITAL SUBSCRIPTION (Cashback, $39 x2).
- **Life event — College-Bound (already started with ACT)**: COLLEGE BOARD SAT (Checks, $68) → KAPLAN ACT PREP TUTOR (Zelle, "Weekly tutor", $200 x4) → COMMON APP FEES (Checks, $385) → COLLEGE TOUR FLIGHTS UA (Travel Card, $1,840).
- **Life event — Retirement progression**: SCHWAB ROLLOVER FEE (Checks, $250) → FIDELITY ANNUITY DEPOSIT (Wire, $50,000, Q3 2025) → MEDICARE PART B SETUP (Checks, $186).
- **Life event — Estate**: MORRISON & FOERSTER LLP (Wire, "Estate planning retainer", $12,500) → GIFT TO DAUGHTER (Zelle, $15,000, Dec 2025).
- **Risk**: BELLAGIO CASINO LV (Premium Card, $750), STAKE.COM*PROC (Premium Card, $320), WESTERN UNION MTO (Cashback, $600 — possible elder fraud signal).

#### `SAMPLE_CSV_NYC_SPORTS_HOME_12` — NYC "Urban Professional", lifeEvents: Education Funding + Career Change
Already has MTA monthly, ConEd, LinkedIn Premium, E*TRADE option exercise, Weil Gotshal estate attorney, etc. Add:
- **Recurring**: SOULCYCLE UNLIMITED (Cashback monthly, $215 x3), NEW YORK TIMES DIGITAL (Cashback, $25 x3).
- **Life event — Education Funding (529)**: VANGUARD 529 CONTRIBUTION (ACH, $5,000 x2 across Q3/Q4), DALTON SCHOOL TOUR FEE (Checks, $150), TEST PREP NYC TUTOR (Zelle, "SHSAT tutor weekly", $250 x4).
- **Life event — Career Change**: WHARTON EMBA APPLICATION (Checks, $275) → GMAT VOUCHER (Checks, $275) → EXEC RECRUITER RETAINER (Wire, "Korn Ferry retainer", $5,000) → LINKEDIN LEARNING (Cashback, $39 x2).
- **Risk**: DRAFTKINGS NJ (Premium Card, $400), ROBINHOOD CRYPTO BUY (Cashback, $1,200), AFFIRM*PELOTON BNPL ($58 x3).
- **Cross-rail**: Zelle "NANNY M — weekly" $650 x4 (childcare signal), Wire to parents "Annual gift" $18,000.

#### `SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12` — Chicago "Adventurer & Investor", lifeEvents: Retirement Planning + Wealth Transfer
Already has dining, golf, fitness, fashion. Add:
- **Recurring**: EAST BANK CLUB DUES (ACH monthly, $295 x4), BARRON'S SUBSCRIPTION (Cashback, $52 x2), TENNIS COACH PRIVATE (Zelle, "Coach weekly", $120 x6).
- **Life event — Retirement**: SCHWAB IRA MAX CONTRIBUTION (Wire, $7,000, Apr 2025), AARP ENROLLMENT (Checks, $16), VANGUARD ROLLOVER FEE (Checks, $250), FIDELITY PENSION INQUIRY (Checks, $0 admin).
- **Life event — Wealth Transfer (dynasty trust)**: SIDLEY AUSTIN LLP (Wire, "Trust formation retainer", $25,000), CHICAGO COMMUNITY TRUST (ACH, "DAF contribution", $50,000), GIFT TO GRANDCHILD 529 (ACH, $17,000).
- **Risk**: BELLAGIO CASINO LV (Premium Card, $1,200), BET365 EU PROC (Premium Card, $400 — offshore signal), KRAKEN CRYPTO BUY (Cashback, $5,000 — concentrated risk).
- **Cross-rail**: Zelle "HOUSEKEEPER L" "Bi-weekly $400 x4".

### Format rules (already established)
- Card rows: zip kept, plain description.
- Checks / ACH / Wire / Zelle: zip empty, description wrapped in literal `"…"`.
- HSA: zip kept, plain description (medical debit card).
- MCC left blank for non-card transfers (matches existing pattern in `SAMPLE_CSV`).

### Files affected
- `src/lib/sampleData.ts` — only file. Each of the five CSV constants gets new rows inserted in date-sorted order so the table renders chronologically clean.

### Out of scope
- `demoData.ts` lifeEvents / topPillars / pillarBreakdown / sampleTransactions arrays. These already declare what each persona "should" show; the data injection brings the CSV evidence into alignment with what's already advertised. No edits to `demoData.ts` unless the user wants the labels updated too — flag if so.

### Validation
- `rg ",Checks$|,ACH$|,Wire$|,Zelle$" src/lib/sampleData.ts | wc -l` should jump from 14 to ~80+.
- For each CSV, `awk` block + `grep` to confirm at least 4 distinct sources.
- Visual QA in `/demo` Selection Dialog for each customer.
