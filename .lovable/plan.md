

## The actual bug

The classifier change shipped — `PALISADES TAHOE LODGE` now carries `Ski` in its subcategories. But the rollup pill still includes it because of an architectural shortcut in the client:

```text
LLM returns:        { label: "Annual Hawaiian Vacations", category_indices: [3] }
                                                                          │
                                                                          ▼
Client expands:     pillars[3].txIndices  →  ALL Hotels & Lodging txns
                                              (Maui Hilton + Tahoe Lodge + Marriott Midtown)
                                              ─────────────┬─────────────
                                                           ▼
Pill displays:      every hotel txn under "Annual Hawaiian Vacations"
```

The LLM is told to emit two rollups for mixed categories (Hawaii pill + Ski pill), but it has no way to say "this specific txn belongs to Hawaii, that one belongs to Ski." Its only handle is the *category* index. So both pills resolve to the full Hotels & Lodging bucket.

## Fix: LLM picks transactions, not categories

Change `synthesize-persona` to return **`transaction_indices`** instead of (or in addition to) `category_indices`. The LLM scans a numbered, per-transaction list — where each row carries merchant + subcategories (including `Ski` / `Tropical Vacation`) — and picks exactly the rows that belong to each rollup.

### What changes

**1. `supabase/functions/synthesize-persona/index.ts` — prompt + schema + input**

- **Input to model** changes from a per-category summary to a **numbered transaction-level list** for travel/lifestyle-prone pillars (Travel, Style, Family, Health, Sports). Each row shows: `[N] MERCHANT · $amt · YYYY-MM-DD · pillar/category · [subcategories]`. Other pillars (Utilities, Insurance, Subscriptions) stay as category summaries — no need for txn-level resolution there.
- **Tool schema** for each rollup now returns:
  - `label` (unchanged)
  - `pillar` (unchanged)
  - `transaction_indices: number[]` — the exact `[N]` rows from the numbered txn list that belong to this rollup
  - drop `category_indices` (or keep as optional fallback)
- **Prompt rule** strengthened: "For each rollup, list ONLY the transaction row numbers whose merchant + subcategories actually fit the rollup's lifestyle. A `Ski`-tagged transaction does NOT belong in an `Annual Hawaiian Vacations` rollup. Use the `[Ski]`, `[Tropical Vacation]`, `[Mountain]`, `[Urban Hotel]` etc. subcategory tags as your primary filter when present."

**2. `src/pages/ExecDemoPage.tsx` — consume the new field**

- Replace the category-expansion logic at lines 261-267 with a direct read: `txIndices = r.transaction_indices` (clamped to valid range, deduped).
- Derive `categoryIndices` from `txIndices` (so existing downstream code that wants the category set still works): `categoryIndices = unique(enrichedTxs[ti].pillar::category)` resolved back to `pillars[]` indices.
- Keep the existing rollup filters (Rule 1: ≥2 categories, Rule 2: life-stage corroboration, Rule 3: incompatible-theme guard) — those still apply at the rollup level. **No new client-side lifestyle-tag filtering** — the LLM is the only authority on membership.

**3. No schema change to `EnrichedTransaction`**

The `subcategories[]` already carry the lifestyle tags from the classifier change. Nothing else to plumb through.

## Why this is the right cut

- **Single source of truth**: the LLM, not the client, decides what belongs in a rollup. No client-side guardrails — per your instruction.
- **Uses the lifestyle tags we just shipped**: the `Ski` / `Tropical Vacation` tags become the LLM's primary filter signal. Generic merchants (Marriott, Delta) without a tag stay ambiguous and get assigned by date context, exactly as the prompt already says.
- **The Tahoe row literally cannot end up in the Hawaii pill** — the LLM never selected it for that rollup's `transaction_indices`. No post-filter, no validation, no client logic to maintain.
- **Existing rollup-level guardrails (≥2 categories, life-stage rules, incompatible-theme rules) keep working** — they're orthogonal to per-txn membership.

## Cost / risk

- Per-call token cost goes up — instead of ~12 category rows we send up to ~80-150 transaction rows (typical demo customer). Still a single Gemini Flash call. Estimated additional 2-4k input tokens per synthesize-persona call, well within budget.
- Risk: LLM could miss transactions and shrink rollups. Mitigation: the prompt explicitly says "include every transaction whose merchant/subcategories fit the lifestyle — be inclusive within the lifestyle theme, exclusive across themes."

## Files Changed

- `supabase/functions/synthesize-persona/index.ts` — input format (numbered txn list), tool schema (`transaction_indices`), prompt update
- `src/pages/ExecDemoPage.tsx` — replace category-expansion with direct `transaction_indices` read; derive `categoryIndices` from resolved txns

## Verification

- /demo → customer with Tahoe + Hawaii travel
- Open "Annual Hawaiian Vacations" pill → contains ONLY Hawaii-themed merchants. `PALISADES TAHOE LODGE` is absent.
- Open "Seasonal Ski Trips" pill → contains ONLY ski-themed merchants. No Maui/Hawaiian Air.
- Console: confirm `r.transaction_indices` arrives populated; confirm `txIndices.length` matches LLM's selection (not the full category bucket size)
- Generic Marriott on a Maui-trip date should land in Hawaii pill via date-context rule; on a Tahoe-trip date should land in Ski pill
- Existing pills for non-travel pillars (e.g. "Style-Conscious Shopper", "Fitness Enthusiast") still resolve correctly — same mechanism, just different lifestyle tags

