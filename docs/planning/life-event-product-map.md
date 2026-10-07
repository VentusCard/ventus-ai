# Life Event → Product Map

How Ventus goes from a transaction pattern to a product recommendation.

There are **11 canonical life events**, not 12. The list is a fixed enum in
`backend/functions/ventus-analyze-lifestyle-signals/index.mjs:172` — the model
cannot invent a twelfth.

Every life event needs **80% minimum confidence** to be emitted at all:

- 3 directly causal transactions = 80%
- 4–5 = 85–90%
- 6+ = 90–95%

Every evidence transaction must pass three tests: it is directly *caused* by the
event ("Buy Buy Baby" yes, "Delta Air Lines" no), the merchant name carries
*specific* context ("Princeton Review SAT Prep" yes, "Staples" no), and an
objective observer would agree without having to assume the connection.

---

## The three that matter most

### Buying a house — "Home Purchase"

**Horizon:** 3–6 months
**Detection:** requires escrow, title company, moving company, or mortgage
evidence. Home improvement stores alone are **not** sufficient.
**Products:** Mortgage Pre-Approval · Homeowners Insurance · HELOC Planning
**Coworker catalog:** `mortgage`, `home-insurance`, `life-insurance` — all three
fire on `home_purchase_intent`
**Blocked when:** DTI high, down payment short, short residency, thin credit
file (mortgage); address in flux (home insurance)

### Having a baby — "New Parent"

**Horizon:** Immediate
**Detection:** requires multiple baby-specific merchant visits. A single baby
store visit could be a gift.
**Products:** 529 Education Savings Plan · Term Life Insurance · Family
Protection Review
**Coworker catalog:** `529-plan`, `life-insurance` — both fire on
`new_child_expected`
**Blocked when:** low liquidity buffer or no monthly surplus (529 — don't pitch
college savings to someone who can't make rent)

### Gearing up for retirement — "Retirement Planning"

**Horizon:** 2–10 years
**Detection:** no explicit false-positive rule; driven by investment and
advisory activity plus age and balance context.
**Products:** Portfolio Rebalancing · IRA / 401k Optimization · Retirement
Income Planning
**Coworker catalog:** `ira`, `managed-portfolio` — both fire on
`retirement_horizon`
**Blocked when:** retirement contribution cap already met (IRA); liquid assets
below minimum (managed portfolio)

---

## The other eight

### College-Bound Child

**Horizon:** 1–4 years
**Detection:** requires test prep, campus visits, or application fees. Back to
school shopping is **not** sufficient.
**Products:** 529 Education Savings Plan · Student Loan Planning · College
Savings Consultation
**Coworker catalog:** nothing. `529-plan` only fires on `new_child_expected`
and `Rising family spend`, so a parent with a 16-year-old and SAT prep charges
gets no 529 outreach. This is the clearest gap in the map.

### Major Wealth Event

**Horizon:** Immediate
**Products:** Wealth Management Consultation · Tax Planning · Investment
Portfolio Review
**Coworker catalog:** `managed-portfolio`, `trust-account` — both fire on
`estate_inflow`

### Aging Parent Care

**Horizon:** Varies
**Products:** Long-Term Care Insurance · POA / Estate Planning · Caregiver
Financial Planning
**Coworker catalog:** `trust-account`, on `elder_care`

### Relocation

**Horizon:** Immediate
**Detection:** only flagged if travel signals a move — one-way flight plus
moving company plus new utility setup in a different zip. Ordinary travel is
handled by a separate system and must not trigger this.
**Products:** New Home Mortgage · Moving Expense Planning · Local Banking Setup
**Coworker catalog:** `mortgage`, on `relocation`

### Job Change & Equity Event

**Horizon:** Immediate
**Products:** 401k Rollover · Stock Option Planning · Emergency Fund Review
**Coworker catalog:** nothing. This is the highest-urgency event we detect and
act on least — a rollover window is a matter of weeks.

### Empty Nest

**Horizon:** 2–5 years
**Detection:** requires evidence of children leaving — dorm and move-in
purchases, reduced family food spend, sudden downsizing activity.
**Products:** Retirement Savings Acceleration · Estate Planning Review ·
Downsizing Consultation
**Coworker catalog:** nothing

### Wedding / Engagement

**Horizon:** 6–18 months
**Detection:** requires venue, catering, or jewelry alongside other wedding
evidence. A single jewelry purchase is not sufficient.
**Products:** Joint Financial Planning · Beneficiary Update Review · Wedding
Savings Account
**Coworker catalog:** nothing

### Business Formation

**Horizon:** 1–2 years
**Products:** Business Checking Account · SEP-IRA / Solo 401k · Business Credit
Card
**Coworker catalog:** nothing, and there is no business product to map to. This
one is a catalog gap, not a wiring gap.

---

## The problem to fix

The product names above come from `DEFAULT_PRODUCT_MAPPING`
(`ventus-analyze-lifestyle-signals/index.mjs:95`). All 11 events are mapped
there, so the API always returns product suggestions. But those are **prose
strings**, not catalog entries — "Family Protection Review" is not something a
member can open.

The coworker runs off a different layer: `product-catalog.json`, 13 real
products with eligibility rules, disqualifiers, and dollar benefits. That layer
only knows **7** life-event tokens, and they are snake_case rather than the
production Title Case:

`new_child_expected` · `home_purchase_intent` · `home_renovation` ·
`retirement_horizon` · `estate_inflow` · `relocation` · `elder_care`

So of 11 detected events:

- **6 reach a real product** — New Parent, Home Purchase, Retirement Planning,
  Major Wealth Event, Aging Parent Care, Relocation
- **4 could with a mapping change** — College-Bound Child → `529-plan`,
  Job Change & Equity Event → `ira` + `managed-portfolio`, Empty Nest →
  `managed-portfolio` + `ira`, Wedding / Engagement → `high-yield-savings` +
  `life-insurance`
- **1 has no product to reach** — Business Formation

One token also runs the other way: `home_renovation` drives the HELOC in the
coworker, but it is not in the production enum. In production the HELOC has no
life-event trigger at all.

**Bottom line:** "we detect eleven life events" is true, and "we act on six" is
also true. Closing that gap is naming and mapping work, not new detection.
