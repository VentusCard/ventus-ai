## Goal
Replace the static, persona-template "Imagery direction" caption with a **per-microsegment stock-image query** derived from the actual selected product + that persona's assigned signal chips. No image generation — just a clean, searchable brief ready to hand off to a stock image selector (Getty, Unsplash, internal DAM).

## Approach
Compute imagery on the fly per persona card from real data, not from a hardcoded template string. Each microsegment gets a distinct, signal-grounded brief so a stock picker can act on it.

## New helper
`src/lib/segmentImageryBrief.ts`
- Export `buildImageryBrief({ productId, personaLabel, signalIds }): ImageryBrief`
- `ImageryBrief` shape:
  - `query: string` — short stock-search query (5–8 words, e.g. "coastal marina sunrise, neutral, no people")
  - `keywords: string[]` — 4–6 atomic tags derived from signals (marine, coastal, dusk, brass, study, nursery…)
  - `mood: string` — one of a small fixed set (Editorial calm, Quiet luxury, Warm domestic, Architectural minimal, Outdoor leisure)
  - `composition: string` — short note (e.g. "Object-forward, shallow depth, off-center")
  - `avoid: string[]` — always includes "logos", "identifiable faces", plus signal-aware exclusions
- Mapping table from `assetSignalId` → keyword/mood fragments (hand-authored, ~30 signals across the product catalog). Falls back to product-level defaults when no signals are selected.
- Pure function, no network calls, fully synchronous.

## Frontend changes
`src/components/tepilot/campaigns/SegmentOutputPanel.tsx`
- Drop the static `imagery` string from `PERSONA_TEMPLATES`.
- For each rendered persona, call `buildImageryBrief(...)` with that persona's resolved `signalIds` + the active `productId`.
- Replace the current "Imagery direction" right-column block with a compact stock-brief card:
  - Header chip: `Stock image brief`
  - Large line: the `query` (monospace-ish, copyable)
  - Row of `keywords` as small chips
  - Two muted micro-labels: `Mood · {mood}` and `Composition · {composition}`
  - `Avoid: …` line in slate-500
  - A small "Copy brief" ghost button (uses `navigator.clipboard.writeText` on a formatted multi-line string) and a "Send to stock picker" outline button that is a **no-op stub** with a toast `"Queued for stock selection"` — wired so a real integration can drop in later.
- Keep the existing slate gradient placeholder swatch above the brief as a visual stand-in for the eventual image.

## Out of scope
- No edge function, no image generation, no real stock API integration.
- No changes to Automated Flows, Campaign Builder steps, signal catalogs, audience estimator, or message copy.
- No persistence.

## Files touched
- New: `src/lib/segmentImageryBrief.ts`
- Edit: `src/components/tepilot/campaigns/SegmentOutputPanel.tsx`
