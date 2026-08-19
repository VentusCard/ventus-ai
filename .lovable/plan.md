# Fix nonsense signals on Automated Flows

## What's wrong (verified in `src/lib/flowSignalFamilies.ts`)

Signals are attached to a product by regex-matching the product's **id + name + category**. That produces false matches:

- 529 College Savings Plan: the word "Savings" matches the deposit pattern and the "Wealth" category matches the invest pattern. So the flow inherits deposit/HYSA signals ("Chasing a better rate elsewhere", "Cash sitting still", "Rents their home", "Uses the app constantly") and investing signals that have nothing to do with a college plan.
- The same category-matching applies to every Wealth / Deposits / Cards product, so generic filler signals show up everywhere.
- Nothing caps how many signals a flow gets — 529 ends up with 16 triggers, so the list reads as noise instead of targeting logic.
- Weak-relevance signals sit next to the real ones with no ordering, so "Steady paycheck coming in" outranks "Has a child heading to college" visually.

## Fix

1. **Stop matching on category.** Tag inference reads product id + name only. Category is used only as a soft hint for a small, explicit allow-list (e.g. Wealth -> may add investing signals *only* if the product is actually an investing product, not an education or insurance one).
2. **Tighten the patterns.** "Savings Plan" / "college savings" no longer counts as a deposit product; "Wealth" alone no longer counts as invest; the deposit tag requires an actual deposit noun (checking, savings account, CD, money market, HYSA, sweep).
3. **Add exclusion rules per tag.** Education products never receive deposit-rate, renter, or generic digital-engagement signals. Insurance never receives brokerage-funding signals. Business products never receive household/parenting signals. Each tag declares which supplemental keys it forbids.
4. **Relevance-rank and cap.** Each supplemental signal is scored (direct product match > adjacent > generic). Keep at most: 3 life-event, 3 behavioral, 3 financial, 2 demographic — so a flow shows roughly 8-11 signals instead of 16, ordered strongest-first inside each family. Authored signals on the product always rank first and are never dropped.
5. **Cap risk filters at 3** per flow and keep only filters that apply to that product type (suitability for advisory, credit checks for underwritten products, coverage gap for insurance).
6. **Audit pass over all 76 flows.** After the rule change, print the resulting signal set for every flow and manually review it; anything still off gets a targeted per-product override in a small explicit map (`SIGNAL_OVERRIDES`) so the rules stay simple.

Audience math and the existing weight/pass-rate model stay as they are — only which signals appear and in what order changes, plus the totals that follow from a shorter list.

## Expected result for the 529 plan

Life Event: new baby, child heading to college, (household formation drops out)
Behavioral: already saving for school elsewhere, already has a 529 at another provider
Financial: paying tuition, money left over each month
Demographic: has school-age children, two earners in the household
Risk filter: outside the suitability range

## Technical notes

- All changes in `src/lib/flowSignalFamilies.ts`: `TAG_PATTERNS`, `tagsFor`, `supplementalFor`, plus new `TAG_EXCLUSIONS`, relevance scoring and per-family caps, and an optional `SIGNAL_OVERRIDES` map keyed by flow id.
- No UI changes in `ProductAutomatedFlowsView.tsx`; it already renders whatever the expansion returns.
- No backend, prompt, or model changes.
