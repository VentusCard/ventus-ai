## Audit of current page

The page reads as a generic depth/penetration dashboard. Two problems:

- **Cross-sell** shows one flat table of gaps → no "why now" trigger, no per-customer propensity, no confidence. It looks like a static report, not an engine.
- **Risk** is only the At-Risk & Thin tile (single-product / dormancy). Vice, AML, wallet-share leakage, and financial vulnerability — all things the Ventus risk engine already covers — are absent.
- The portfolio strip is purely growth-flavored. There's no counterweight showing what the engine is protecting.
- Life events, cross-sell, and risk currently live as isolated tiles. There's no visible flow from *signal → next-best-action*, which is the actual Ventus story.

No new banner, no "What Ventus does" heading. Everything below is expressed through the existing modules and their labels.

## Changes (single file: `src/components/tepilot/insights/RelationshipIntelligenceView.tsx`)

### 1. Portfolio strip — rebalance to growth + protection
Replace the 4 metrics with a 4-up strip that shows both lenses without labelling them:
- Customers Scanned — 2.4M
- Growth Signals (90d) — e.g. "184k" (cross-sell + life-event triggers ready to action)
- Protection Signals (90d) — e.g. "42k" (risk/leakage/vulnerability flags)
- Est. Annual Opportunity — $ figure rolled from cross-sell tiles

### 2. Cross-Sell Whitespace tile — turn it into a propensity engine view
Rewrite `CrossSellModule` drill-in (keep the tile card as-is, just refresh copy):
- Keep the gap table but add two columns: **Trigger** (2-3 behavioral chips per row, e.g. "recurring rideshare", "raise in payroll deposits", "new mortgage escrow") and **Propensity** (High/Med/Low pill).
- Below the table, add a compact **"Signal → Next-best product"** flow strip: 3 example rows showing `behavioral signal → life event context → recommended product → est. per-household uplift`. Reinforces that the recommendation comes from enrichment, not a static rule.
- Small footer line: refreshed daily from transaction enrichment. No brand slogan.

### 3. Split the risk story into two tiles instead of one
Rename `atrisk` tile to **Relationship Attrition** (thin/dormant/wallet-share leakage — the "we're losing them" lens). Add a **new tile** `exposure` = **Portfolio Exposure** covering the risk-engine categories.

Bento becomes 7 tiles (grid stays 3-col; last row has 1 tile spanning naturally or 3+4 layout — keep simple `grid-cols-3` and let the 7th wrap).

**Relationship Attrition drill-in** (evolved from current AtRiskModule):
- Keep the current at-risk client list but reframe MiniStats to: Thin (1 product), Dormant 90d+, **Outbound to competitor rails** (wallet-share leakage — ACH/Zelle to other institutions, per Wallet Share Intelligence memory), Declining Engagement.
- Add a small "Recommended play" column per cohort (Win-back offer / Re-engagement campaign / Retention outreach).

**Portfolio Exposure drill-in** (new module):
- 4 cohort rows aligned with the risk-detection memory (Vice, Suspicious International, AML) plus Financial Vulnerability from FVI memory:
  - Vice velocity — gambling / payday / pawn recurrence
  - Suspicious international — OFAC-adjacent corridors, unusual FX
  - AML patterns — structuring, layering, round-number velocity
  - Financial vulnerability — overdraft-reliant, thin buffer, income shock
- Each row: definition, household count band, severity badge, recommended routing (AML review / hardship program / compliance queue / advisor outreach).
- Copy stays vaguely specific (no exact counts of transactions or dollars), per project memory.

### 4. Life Events tile — thin bridge to the other two lenses
In `LifeEventsModule`, add a single-line footer strip under the 7-event grid: "Each detected event feeds the cross-sell engine and re-scores relationship risk." No extra UI, just a one-liner reinforcing the flow.

### 5. TabHeader copy
Tighten `howItWorks` / `whyItMatters` so they read as one engine with two lenses (growth + protection) rather than a portfolio browser. Keep to existing tone rules (no infrastructure names, no competitor names, no exact spend).

## Out of scope
- No sidebar, routing, backend, or type changes.
- No new files. No changes to `bankProductCatalog.ts`, `randomProfileGenerator.ts`, or `AnalyticsContainer.tsx`.
- All new numbers mocked in-file, consistent with existing tiles.
