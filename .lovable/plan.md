# Update HELOC signals in Automated Flows

Rework the "Home Equity Line of Credit" flow's signal list in `src/lib/productAutomatedFlows.ts` so it reflects the real reasons customers tap home equity, and order signals by family — life-event signals first, behavioral second (matching how the flow card groups them).

## New signal list (ordered: life-event → behavioral)

Life-event:
1. **Major home renovation underway** — large card charges at building-material retailers plus bank payments to contractors within a 90-day window (upgrade of the existing "Big home renovation" signal, now typed life-event).
2. **Expected medical bills** — recurring or large payments to hospitals, surgical centers, orthodontists, or out-of-network specialists signaling a financing need.
3. **College tuition payments starting** — new recurring tuition payments to academic institutions alongside home equity-rich profile.
4. **Home purchase or move with equity left behind** — recent sale/purchase activity with substantial proceeds sitting in deposit accounts.

Behavioral:
5. **Long-time homeowner with strong equity** — 5+ years of mortgage payments, property tax, and utility payments (equity eligibility proxy).
6. **High-interest card balances carried monthly** — persistent revolving balances with interest charges, prime consolidation candidate.
7. **Funding projects from outside accounts** — incoming transfers from another bank followed by home-improvement spend (existing signal, kept).

Removed: "Pays property taxes regularly" (weak standalone signal — folded into the equity signal).

## Implementation details

- Edit only the `heloc` entry (id `"heloc"`, ~line 273–287) in `src/lib/productAutomatedFlows.ts`.
- Each signal keeps the `{ label, evidence, type }` shape with the existing vaguely-specific evidence style (no exact amounts, channel-tagged phrasing).
- Signals render in array order in `ProductAutomatedFlowsView`, so array order = life-events first, behavioral second.
- Keep `estimatedAudience` / `penetration` as-is unless the richer signal set warrants a small bump (19.6M → ~21M) — flag in review.
- No changes to `productFlowBenefits.ts` (HELOC benefits copy stays valid) or other flows.
- Strict light theme untouched; no UI structural changes — this is data-only.
