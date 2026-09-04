# Plan: Make the Segments sub-tab convey the real cohort size

## Problem
`CUSTOMER_DIRECTORY` is a 16-profile fixture. When a signal is exported from the Intelligence Database, the narrowing logic often leaves **one** visible customer — visually underselling a cohort of, say, 3.7M book customers. The banner states the number but the table feels empty.

## Fix: generated representative profiles + a scale visual

### 1. Deterministic sample synthesis (`src/lib/segmentSampleSynthesis.ts`, new)
- When a segment seed is active, generate **24 additional representative profiles** beyond the real fixture matches.
- Deterministic (seeded from `segment.label`): stable across re-renders and navigation — same segment always yields the same profiles.
- Profiles composed from realistic pools: first/last names, cities (drawn from the geography data already used elsewhere in `/bankdemo`), tiers weighted by the segment's family, relationship values, products, and signal entries that reference the segment label + its evidence line.
- Each synthetic customer carries the segment's signal in the matching family field, so detail panels stay consistent.
- Mark synthetic rows `synthetic: true` (optional flag on `DirectoryCustomer`).

### 2. Table presentation (`CustomersDirectoryView.tsx` + `CustomerResultsTable.tsx`)
- Real fixture customers render first; synthetic representatives follow.
- Synthetic rows get a subtle "illustrative" chip in the name cell (or an italic style) — per demo honesty conventions, never presented as real named customers.
- Clicking a synthetic row still opens the Customer Detail Panel (all fields are populated).
- Update the caption above the table: "Showing 25 representative profiles — the full cohort is **3.7M customers** (1 profile ≈ 148K customers)".

### 3. Scale visualization in the segment banner
Add a compact one-line density bar beneath the population line in the segment banner:
```text
[██████████████░░░░]  25 shown of 3.7M  ·  every 1 profile represents ~148K customers
```
Renders as a thin 4px track with the visible-sample fraction filled, reinforcing magnitude without clutter.

### 4. Guardrails
- Synthesis only runs when a segment seed is active; the free-search path keeps the 16 real profiles unchanged.
- Export buttons (CSV/JSON) stay scoped to the real fixture rows (add a toast note "export covers real profiles; shown sample is illustrative").
- Existing population/metrics math (`segment.customers`, `scaleSample`) untouched — synthesis affects display rows only, not the reported book numbers.

## Verification
- Typecheck + build.
- Playwright: from Intelligence Database click a Behavioral signal, a Risk signal, and a family count — confirm each lands in Segments with ~25 rows, the density bar, correct population text, and working detail panel on a synthetic row.
