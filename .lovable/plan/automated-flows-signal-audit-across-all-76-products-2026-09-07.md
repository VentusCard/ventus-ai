# Automated Flows — signal audit across all 76 products

I read out the fully expanded signal set for every one of the 76 flows and compared it against what each product actually needs. The authored signals (the top life-event rows) are almost all good. The problems are in the auto-generated supplements, where a handful of generic rows get pasted onto most flows — including flows they contradict.

## What's wrong today

**1. Three filler rows dominate the tab**
- "Already has this at another bank" appears on 51 of 76 flows
- "Two earners in the household" on 44 of 76
- "Steady paycheck coming in" on the large majority of lending, deposit and insurance flows

They carry no product-specific meaning, and on a screen meant to show precision targeting they read as padding.

**2. Signals that contradict each other on the same flow**
- Personal line of credit: life event "Paycheck stopped or shrank" sits next to financial "Steady paycheck coming in"
- Balance transfer card: "Carrying expensive debt" next to "Barely uses their credit limit"
- Personal loan: "Debt building up" next to "Barely uses their credit limit"
- Solo restart checking (customer now single): "Two earners in the household"
- Teen/youth savings, student credit card: "Two earners in the household" as the customer-level signal

**3. Wrong household frame on business products**
- Commercial real-estate mortgage gets consumer home rows: "Owns their home", "Long-tenure homeowner", "Dual-income homeowner", plus "Existing HELOC at another lender" and "Reaching for liquidity"
- Business checking gets "Rents their home"
- Equipment financing gets "Spending more on home repairs"
- Business credit/fleet/purchasing cards get the consumer delinquency filter

**4. Consumer HELOC financial block bleeding onto every "home" product**
"Existing HELOC at another lender / Mortgage payment to an outside servicer / Carrying higher-cost debt / Reaching for liquidity" was written for HELOC but now appears identically on purchase mortgage, second-home mortgage, construction loan, homeowners insurance and commercial mortgage. On a purchase mortgage, "already has a mortgage elsewhere" is the wrong story.

**5. Insurance products all inherit "Has young children"**
Correct for life and disability. Wrong for pet insurance, long-term-care insurance (an eldercare product), umbrella and auto.

**6. Investing products are indistinguishable**
Robo portfolio, hybrid advisor, self-directed brokerage, private wealth and values portfolio all end with the identical trio "Investing somewhere else / Cash sitting still / High-net-worth household". A robo product should not require a high-net-worth household; private wealth should not look like a robo flow.

**7. Business flows are indistinguishable**
Every business product ends with the same four rows (card sales, quarterly taxes, self-employed, runs a business), so merchant services and a solo 401(k) look identical.

## What will change

All changes are in the supplement rules; authored life-event signals and the recently recalibrated risk filters stay as they are.

**Retire the filler**
- Drop "Already has this at another bank" as an automatic supplement. Keep it only where the switch story is the actual play (high-yield savings, money market, CD, balance transfer, cobrand, auto refi, student loan refi, 401k rollover, IRA, business banking switch).
- Replace the blanket "Two earners in the household" default with a household frame chosen per product: single earner, early career, business owner, retiree or dual income — and no household row at all where it adds nothing.
- Use "Steady paycheck coming in" only where repayment or contribution capacity is the point, and use the self-employed income equivalent on business flows.

**Add contradiction guards**
A small conflict table so a flow can never show both sides of the same fact: paycheck stopped vs steady paycheck; carrying debt vs low utilization; now single vs dual income; renter vs homeowner. The lower-relevance row is dropped.

**Separate the business frame from the household frame**
Business flows lose consumer homeowner, renter, home-repair and consumer HELOC rows, and get business-specific financial and demographic rows (deposit volatility, seasonality, payroll size, years in operation, industry). Commercial real-estate mortgage moves fully to the business frame and uses business credit filters instead of the consumer secured-loan filter.

**Split the home financial block by intent**
- Purchase mortgage: rent-vs-payment gap, down-payment build-up, outside pre-approval shopping
- HELOC: unchanged (equity, outside servicer, higher-cost debt, liquidity)
- Construction loan: staged builder payments, permits, land
- Homeowners insurance: coverage-gap and premium rows, not equity-tap rows

**Differentiate the investing ladder**
Give each tier its own qualifying rows: robo (small recurring contributions, first-time investor, low balance), self-directed (multi-platform trading, crypto venues, research activity), hybrid (advice-seeking, fee-paying elsewhere), private wealth (multi-entity, concentrated stock, private-club and multi-property evidence). "High-net-worth household" stays only on the top two tiers.

**Fix the insurance demographics**
Young children for life and disability; aging-parent/pre-retiree for long-term care; multi-vehicle for auto; pet owner for pet; multi-property and high liability for umbrella.

**Small per-product corrections**
- HSA trigger becomes high-deductible-plan evidence rather than catch-up age
- Motorcycle loan life event becomes powersport purchase intent rather than "getting insurance quotes"
- Teen/youth savings and student card get an age-appropriate household frame (parent-managed / early career)

## Technical notes

- All edits land in `src/lib/flowSignalFamilies.ts`: the `FINANCIAL` / `DEMOGRAPHIC` / `EXTRA_BEHAVIORAL` seed maps and `supplementalFor`, plus a new conflict-suppression pass applied before family caps in `expandFlowSignals`.
- Product intent is currently inferred from tags plus name regexes; the flows that need a distinct story (investing tiers, business products, home intents) get explicit `flow.id` branches, the same pattern already used for `heloc` and `529-plan`.
- Filter assignment for commercial/business-card products switches from consumer secured/delinquency filters to the business credit set; pass-rate bounds and `filterCascade` math are untouched.
- Audience math is unaffected: `allocateSignalAudiences` re-splits over whatever signal set results, so the existing exact-sum guarantees hold.

## Verification

- Re-run the full 76-flow dump and confirm no flow shows a contradictory pair, no supplement appears on more than ~20 flows, and each product family reads distinctly.
- Re-run the arithmetic assertion across all 76 flows (signals sum to audience, filters reconcile to qualified).
- Typecheck plus a browser pass on `/bankdemo` → Automated Flows spot-checking mortgage, commercial real-estate mortgage, robo portfolio, private wealth, personal line of credit and pet insurance.
