
Goal

- Stop bogus rollups like “Suburban Nursery Setup” when the evidence is just repeated Shell gas + one Pottery Barn Kids purchase.
- If categories do not clearly belong together, do not roll them up at all.

What’s actually causing it

- In `supabase/functions/synthesize-persona/index.ts`, the prompt currently forces one rollup for every pillar with 2+ categories.
- In `src/pages/ExecDemoPage.tsx`, the client accepts that rollup as long as the category indices resolve and there are transactions.
- That means a broad pillar can get compressed into a fake archetype even when the categories are unrelated.
- The UI already supports partial coverage, so we do not need to force every category into a rollup.

Implementation plan

1. Make rollups optional, not mandatory
- Update `supabase/functions/synthesize-persona/index.ts` so the model can return:
  - no rollup for a pillar,
  - one rollup,
  - or multiple smaller rollups within the same pillar.
- Add explicit rules:
  - never combine unrelated categories just because they share a pillar,
  - never let a single one-off merchant define the whole label,
  - never use family/nursery/suburban/new-parent style labels without at least 2 corroborating family/nursery signals.

2. Add stronger evidence rules to the synthesis payload
- In `src/pages/ExecDemoPage.tsx`, keep sending merchants, subcategories, counts, spend, and tier.
- Add lightweight support flags per grouped category so the model can distinguish:
  - recurring/core behavior,
  - one-off/high-ticket purchases,
  - dominant vs incidental categories.

3. Validate rollups on the client before rendering
- In `src/pages/ExecDemoPage.tsx`, add a coherence check before accepting each AI rollup.
- Reject rollups that:
  - mix obviously incompatible themes,
  - rely on only one “loud” category to name the cluster,
  - use a life-stage label without enough supporting categories.
- If rejected, drop the rollup and leave those categories as normal chips.

4. Use exact category keys for coverage
- In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, use validated category keys (`pillar + label`) to decide which evidence chips are covered by a rollup.
- Keep the current authoritative `txIndices` / `totalCount` logic for counts.

5. Hardening
- Add a small compatibility layer for obvious cases:
  - good pairings: Netflix/Hulu/Spotify, golf-related signals, nursery-related merchants together,
  - bad pairings: gas/commuting with nursery/kids-home, grocery with streaming, etc.
- Bias toward “show separate chips” instead of “invent a clever rollup”.

Expected result

- Shell stays a commuting/gas signal unless there is real supporting context.
- Pottery Barn Kids only contributes to a nursery/family rollup when there are multiple child/family signals.
- Mixed pillars no longer get collapsed into nonsense labels.
- Counts stay accurate because the existing single-source-of-truth rollup totals remain in place.

Technical details

- Main fix: stop forcing a single rollup per pillar.
- Main safeguard: client-side validation so even if the model gets creative, bad rollups never render.
