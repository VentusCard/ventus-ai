# Update Activation destinations header tagline

## Problem
In `/bankdemo` → **System** tab, the **Activation destinations** section header currently shows a count sublabel: "3 teams · 9 destinations". The user wants this replaced with the tagline "Every Customer, Every Colleague".

## Proposed change
Update `src/components/tepilot/insights/CapabilitiesView.tsx` so the Activation destinations header reads:

**Activation destinations**  **Every Customer, Every Colleague**

Implementation:
- Keep the "Activation destinations" title as the primary section label.
- Replace the right-side count text (`3 teams · {visibleDestinations.length} destinations`) with the tagline "Every Customer, Every Colleague".
- Style the tagline in a slightly lighter/indigo-muted tone to differentiate it from the title, keeping the same header row layout.

No functional or data changes; only copy and styling adjustments.

## Files changed
- `src/components/tepilot/insights/CapabilitiesView.tsx`
