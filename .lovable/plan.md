# Fix Intel Panel classification errors in /bankdemo

Four connected classifier bugs surfaced from your latest run. Edge-function logs and the pill drill-down you pasted confirm each.

## Bug 1 — Airline trips mislabeled "Relocation"

Confirmed in `generate-next-offers` logs: `life event "Relocation" (LE_2) → matched`. Root cause in `supabase/functions/synthesize-persona/index.ts`:
- Relocation regexes only match movers / storage / escrow / utility installs (lines 115, 125).
- Airline/hotel merchants get `owner: null`, and the server guard explicitly permits unowned rows into any bucket (line 705).
- No MCC/vendor negative list keeps travel out of Relocation.

**Fix:** add a Relocation post-LLM guard — if a `life_event.category === "Relocation"` has zero indices tagged `relocation_vendor|relocation_hint`, drop it. Also tighten the prompt to require at least one positive relocation hint. If the dropped indices are airline/hotel merchants, downgrade them into the appropriate Spending Habit pillar rollup instead of silently discarding.

## Bug 2 — Demographic section always empty

Same signal must survive four redundant gates today (LLM prompt → edge-function post-filter → `ExecDemoPage.tsx:407-415` → `ExecDemoIntelPanel.tsx:432-464`), each duplicating the "≥2 unclaimed indices" test and a `NON_DEMO_VOCAB` regex.

**Fix:**
- Relax gate to `≥1 unclaimed index OR ≥1 large_inflow` in `synthesize-persona/index.ts:788-789`.
- Remove the redundant re-gate in `ExecDemoPage.tsx:407-415` (trust the edge function).
- Remove the duplicate `NON_DEMO_VOCAB_RE` block in `ExecDemoIntelPanel.tsx:430-464`; keep only the life-event-name collision dedup.
- Broaden Demographic hint vocabulary server-side (income step change, dependent/tuition presence, sustained new-metro footprint).
- Emit a soft "Established Household · steady income" pill when nothing else qualifies, so the section is never blank in demo mode.

## Bug 3 (NEW) — Spending-habit pills grouping wrong transactions

Your drill-down shows "Skiing & Snowboarding · 13 txns" including **Grand Wailea Resort, Boss Frog Snorkel Tour, Hilton Waikoloa Village** — clearly Tropical Vacation, not skiing. Root cause: `synthesize-persona` builds `pillar_rollups[].transaction_indices` from the LLM without cross-checking against each transaction's already-classified `subcategories`/`category` from `classify-transactions`.

**Fix in `synthesize-persona/index.ts`:** after the LLM emits pillar rollups, filter each rollup's `transaction_indices` to only those whose classified pillar/subcategory matches the rollup theme. Concretely:
- Build a lookup `idx → { pillar, category, subcategories[] }` from the classified transactions passed in.
- For each rollup, drop any index whose classified pillar/category doesn't match the rollup label (e.g., "Skiing & Snowboarding" only accepts rows whose subcategories include `Ski`/`Snowboard` OR pillar=`Sports & Active Living` category=`Skiing & Snowboarding`; "Tropical Travel" only accepts rows tagged `TropicalVacation`/tropical-hotel rows).
- Recompute the rollup's transaction count / $ total after filtering. If a rollup drops below 3 txns post-filter, remove it entirely.

This uses data the pipeline already has (from `classify-transactions`) — no extra LLM call, deterministic, and eliminates the whole class of pill-drill-down mismatches.

## Bug 4 (NEW) — `classify-transactions` still faulting on gpt-5-mini

Logs show every batch failing on primary model with:
`API error (400): Unsupported parameter: 'max_tokens' is not supported with this model. Use 'max_completion_tokens' instead.`
This causes 3 retries per batch, escalates to Gemini fallback, and stretches classify to **47.7s** — which is the main reason the "Behavioral Intelligence: Ready" button is slow.

**Fix in `supabase/functions/classify-transactions/index.ts`:** when the model id starts with `openai/gpt-5` (or contains `-mini`/`-nano` on gpt-5 family), send `max_completion_tokens` instead of `max_tokens`. Model-aware token-param selector, same pattern already used in `synthesize-persona`. This eliminates the fatal-4xx path entirely and should cut classify to ~15–20s.

## Files to change

- `supabase/functions/synthesize-persona/index.ts` — Relocation post-guard, relaxed Demographic gate, broadened Demographic hints, soft-demographic fallback, **pillar-rollup index cross-check against classified pillar/subcategory**.
- `supabase/functions/classify-transactions/index.ts` — model-aware `max_completion_tokens` for gpt-5 family.
- `src/pages/ExecDemoPage.tsx` — remove redundant demographic re-gate at `:407-415`.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — remove `NON_DEMO_VOCAB_RE` and duplicate filter block; keep only life-event collision dedup.

## Out of scope

- No sample-data changes.
- No layout/UI changes.
- No model swaps beyond the token-param fix.
