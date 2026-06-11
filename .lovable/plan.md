# Map BoA + Merrill Catalog into Generic Product Flows

Expand `src/lib/productAutomatedFlows.ts` so `PRODUCT_FLOWS` covers the full Bank of America + Merrill Lynch retail/wealth catalog, each renamed to a generic, vendor-neutral label (per the no-competitor-names rule). Used by `/bankdemo` → `ProductAutomatedFlowsView` and the static `FLOW_MICROSEGMENTS` data.

## Catalog mapping (real product → generic flow name)

### Deposits (category: "Deposits")
- BoA Advantage SafeBalance Banking → **Starter Checking**
- BoA Advantage Plus Banking → **Everyday Checking**
- BoA Advantage Relationship Banking → **Relationship Checking**
- BoA Advantage Savings → **Core Savings** (keep existing **High-Yield Savings** as the premium tier)
- BoA CDs (Featured / Fixed Term / Flexible) → **Certificate of Deposit**

### Cards (category: "Cards")
- Customized Cash Rewards → **Category Cash Back Card**
- Unlimited Cash Rewards → **Flat-Rate Cash Back Card**
- Travel Rewards (existing) → **Travel Rewards Card**
- Premium Rewards → **Premium Travel Card**
- Premium Rewards Elite → **Ultra-Premium Travel Card**
- BankAmericard (low APR / balance transfer) → **Low-Rate Balance Transfer Card**
- Affinity / Alaska / Royal Caribbean co-brands → **Co-Brand Partner Card**
- Business Advantage Customized Cash → **Small Business Cash Back Card**
- Business Advantage Unlimited Cash → **Small Business Flat-Rate Card**
- Business Advantage Travel Rewards → **Small Business Travel Card**

### Lending (category: "Lending")
- Mortgage (existing) → **Mortgage**
- HELOC (existing) → **Home Equity Line of Credit**
- Auto Loan (existing) → **Auto Loan**
- Auto Refinance → **Auto Refinance**
- Personal Loan (existing) → **Personal Loan**
- Small Business Loan (existing) → **Small Business Loan**
- Practice Solutions / Equipment financing → **Equipment Financing**

### Wealth — Merrill (category: "Wealth")
- Merrill Edge Self-Directed → **Self-Directed Brokerage**
- Merrill Guided Investing → **Robo / Guided Portfolio**
- Merrill Guided Investing with Advisor → **Hybrid Advisor Portfolio**
- Merrill Lynch Wealth Management (existing) → **Wealth Management**
- Merrill Private Wealth Management → **Private Wealth Management**
- Merrill Edge IRA (Traditional / Roth / Rollover) → **Individual Retirement Account**
- 529 Plan (existing) → **529 College Savings Plan**
- Merrill Trust / Estate services → **Trust & Estate Services**
- Merrill SRI / ESG portfolios → **Values-Aligned Portfolio**

### Insurance (category: "Insurance")
- Term Life (existing) → **Term Life Insurance**
- Permanent / Whole Life via Merrill → **Permanent Life Insurance**
- Long-Term Care via Merrill → **Long-Term Care Insurance**
- Annuities (Fixed / Variable) → **Annuity**

### Net new flows to add (~16)
Core Savings, Certificate of Deposit, Starter / Everyday / Relationship Checking, Category Cash Back Card, Flat-Rate Cash Back Card, Premium Travel Card, Ultra-Premium Travel Card, Low-Rate Balance Transfer Card, Co-Brand Partner Card, Small Business Cash Back Card, Auto Refinance, Self-Directed Brokerage, Robo / Guided Portfolio, Hybrid Advisor Portfolio, Private Wealth Management, IRA, Trust & Estate Services, Annuity, Permanent Life, Long-Term Care.

## Per-flow shape (unchanged)
For each new entry, populate:
- `id` (kebab-case), `name` (generic label), `category`, `icon` (Lucide), `positioning` (one sentence)
- 3–4 `signals` mixing `life-event` and `behavioral`, each with `evidence` describing transaction-level cues (no merchant names that name competitors)
- `estimatedAudience` and `penetration` realistic for the US market
- `defaultActive` true for the headline products per category (Checking, Core Savings, IRA, Self-Directed Brokerage, Category Cash Back); existing defaults preserved

## Static microsegments
Regenerate `src/lib/productMicrosegments.ts` so `FLOW_MICROSEGMENTS` has an entry for every new flow id, using the same one-shot generation script pattern already in use (4–7 word title, ≤60 char subject, 3–5 sentence body, 3–5 word CTA). One microsegment per signal, per flow.

## Constraints honored
- No mention of "Bank of America", "Merrill", "BofA", "Preferred Rewards" etc. in any user-visible label, positioning, evidence, or microsegment copy.
- Strict light theme, Manrope, existing card grid — no UI changes.
- Pure data expansion; `ProductAutomatedFlowsView.tsx` does not change.

## Files touched
- `src/lib/productAutomatedFlows.ts` — add ~20 entries
- `src/lib/productMicrosegments.ts` — regenerate to cover all flow ids

No edge functions, no schema, no component changes.
