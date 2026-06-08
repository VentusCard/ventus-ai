## Goal
Make Campaign Builder fully generative: Lifestyle Asset Signals come from AI per selected product (curated catalog removed), and the segment output (personas, copy, imagery brief) is generated from the chosen product + selected signals + life events + pillars + demographics. Manual buttons only — nothing auto-fires.

## Two new edge functions

### 1. `supabase/functions/generate-lifestyle-signals/index.ts`
- Input: `{ productId, productName, productCategory, productPositioning }`
- Model: `google/gemini-3-flash-preview` via Lovable AI Gateway, tool-call mode.
- Tool schema returns `{ signals: [{ id, label, description, detectionRate }] }` with 8–10 items.
  - `id`: short kebab-case, prefixed with productId.
  - `label`: 2–4 words, "vaguely specific" tone (per Core memory) — behavioral, not "X transactions/month".
  - `description`: ≤14 words, names evidence type without exact counts/dollars.
  - `detectionRate`: 0.003–0.20 range, model-estimated.
- System prompt enforces: no competitor brand names, no risk/stress language, no exact transaction counts or dollar amounts, finance-marketing-appropriate.
- Standard CORS; 429/402 passthrough.

### 2. `supabase/functions/generate-campaign-segment/index.ts`
- Input: `{ productName, productPositioning, selectedSignals: [{label, description}], lifeEvents: string[], pillars: string[], demographics, audienceSize }`
- Model: same. Tool schema returns:
  ```
  { personas: [{
      label,            // 4–7 words, archetype phrasing
      signalLabels,     // subset of input signal labels assigned to this persona
      sharePct,         // 0–100, all personas sum ~100
      subject,          // <=60 chars
      body,             // 2–3 sentences, banker-grade tone
      cta,              // 3–5 words
      imageryBrief: {
        query,          // 5–8 word stock query
        keywords,       // 4–6 atomic tags
        mood,           // one of: Editorial calm, Quiet luxury, Warm domestic, Architectural minimal, Outdoor leisure, Considered craft
        composition,    // 1 short line
        avoid           // 2–4 items
      }
  }] }
  ```
- Exactly 3 personas (keeps UI density and matches existing slot count).
- System prompt: no em dashes, no exact spend/transaction counts ("vaguely specific"), no competitor names, no risk/stress framing, imagery briefs must avoid identifiable faces and logos.

Both functions follow the existing `generate-campaign-brief/index.ts` pattern (corsHeaders, AI Gateway URL, tool_choice forced, 429/402 passthrough, JSON parse fallback).

## Frontend changes

### `src/lib/lifestyleAssetSignals.ts`
- Keep the `LifestyleAssetSignal` + `estimateAssetSignalAudience` exports (estimator still operates on whatever signals are currently in state).
- **Remove** the hardcoded `ASSET_SIGNALS_BY_PRODUCT`, `getAssetSignalsForProduct`, and `findAssetSignal` exports — campaign builder now holds generated signals in component state.
- Keep `GENERIC_FALLBACK` only as a tiny safety net for the estimator if a signal id has no detectionRate.
- The estimator switches to accept the in-state signals array directly rather than looking them up.

### `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`
- New state: `generatedSignals: LifestyleAssetSignal[]`, `signalsLoading`, `signalsError`.
- Replace the Lifestyle Asset Signals `DimensionChipCloud` data source with `generatedSignals`. When empty, render an empty state inside the section: "No lifestyle signals yet" + a primary `Generate signals` button that calls `supabase.functions.invoke('generate-lifestyle-signals', { body: { productId, productName, productCategory, productPositioning }})`.
- After signals load, show a small secondary `Regenerate` button next to the section title and the chip cloud.
- On product change, clear both `generatedSignals` and `assetSignals` selection; user must click Generate again. This keeps "manual buttons only" honest.
- Replace the existing `SegmentOutputPanel` flow:
  - Keep the `Generate Segment` CTA but rewire it to call `supabase.functions.invoke('generate-campaign-segment', …)` with the selected signal full objects (label + description), life events, pillars, demographics, and audience size.
  - Track `segmentLoading`, `segmentError`, and `generatedSegment` (the `{ personas }` payload).
  - Show inline error toasts for 429 ("Rate limit — try again shortly") and 402 ("AI credits exhausted — add credits in workspace settings"), per `connecting-to-ai-models-classic-stack` rules.

### `src/components/tepilot/campaigns/SegmentOutputPanel.tsx`
- Refactor to take a fully-formed `personas: GeneratedPersona[]` prop instead of computing personas locally.
- Each persona renders exactly as today (chips, message, CTA, stock brief, copy/Open-in-picker buttons) but every field comes from the model.
- `buildImageryBrief` is **no longer called** for the body. Keep `formatImageryBriefForClipboard` and stock-picker URL helpers — they now operate on the model-returned `imageryBrief`.

### `src/lib/segmentImageryBrief.ts`
- Keep `ImageryBrief` type + `formatImageryBriefForClipboard` (used by copy + stock picker).
- Remove `buildImageryBrief` and the large hardcoded `SIGNAL_FRAGMENTS`/`PRODUCT_DEFAULTS` tables — they're dead once personas ship with model-generated briefs.

## Loading + empty states
- Signal section: skeleton row of 8 chip placeholders while loading.
- Segment panel: skeleton with 3 persona-shaped cards while loading.
- Errors render as a slate-200 banner inside the section with a Retry button calling the same invoke.

## Out of scope
- Automated Flows view — untouched.
- Life Events and Lifestyle Pillars dimension chips — still curated, not generated.
- Audience estimator math — unchanged; just operates on the generated signal objects.
- No image generation (already settled — stock brief only).
- No persistence; session-only state.

## Files touched
- New: `supabase/functions/generate-lifestyle-signals/index.ts`
- New: `supabase/functions/generate-campaign-segment/index.ts`
- Edit: `src/lib/lifestyleAssetSignals.ts` (remove curated catalog, simplify estimator)
- Edit: `src/lib/segmentImageryBrief.ts` (remove builder + fragment tables, keep types + formatter)
- Edit: `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx` (generate signals + segment flows, empty/loading/error states)
- Edit: `src/components/tepilot/campaigns/SegmentOutputPanel.tsx` (consume model-supplied personas)

## Memory update
Add `mem://features/bankdemo/campaign-builder-generative` documenting: signals + segment are AI-generated, manual buttons only, exactly 3 personas, no em dashes / no exact $ or txn counts, no curated signal catalog anymore.
