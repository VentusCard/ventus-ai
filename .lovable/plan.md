Restructure `TargetingOverviewView.tsx` so the three functions sit **side-by-side in one row** instead of stacked full-width.

## Layout changes
- Outer container: narrower, `max-w-[960px]` and centered (so it doesn't fill the panel).
- Keep the hero block (eyebrow, H1, sub) — but a touch more compact.
- Remove the "Why it matters" row of pills and the "How they work together" 3-step strip. Their job is now done by the three cards themselves.
- Replace the stacked card stack with a single `grid grid-cols-3 gap-4` row of compact cards.

## Card design (compact, equal-height)
Each card (Automated Flows / Campaign Builder / Next-product):
- Vertical layout, equal height (`h-full flex flex-col`).
- Top: small icon tile + title + 1-line tagline.
- Middle: 3 short bullets (what it does).
- "What's different" callout pinned near the bottom — this is the side-by-side comparison surface.
- Bottom: text-link CTA "Open →" calling `setActiveTab(...)`.
- Whole card clickable (button), light border, subtle hover.

## Out of scope
- Nav header behavior (unchanged).
- Copy rewrites beyond trimming for the tighter card.
- Other section overviews.

## Files
- Edit: `src/components/tepilot/insights/TargetingOverviewView.tsx` only.
