

# Stacked-Card Keynote Layout

## Problem
Currently all 6 beats stack vertically with margins, pushing content off-screen and requiring scroll. The presenter shouldn't need to scroll.

## Solution
Restructure the layout so the **active beat is always centered on screen**, and previous beats collapse into small stacked summary cards pinned at the top. Each collapsed card shows a one-line takeaway.

### Layout Architecture
- **Container**: `h-screen` with `overflow-hidden` (no scrolling)
- **Top stack zone**: Previous beats render as thin collapsed cards (border, rounded, ~py-2 px-4) stacked at the top with slight overlap/offset, showing only a one-line summary
- **Center zone**: `flex-1` centered area where the active beat renders at full size
- Future beats remain hidden

### Collapsed Card Summaries
| Beat | One-liner |
|------|-----------|
| 1 | "Billions in personalization spend — zero customer understanding." |
| 2 | "Built on MCC — a 1974 taxonomy for routing, not intelligence." |
| 3 | "MCCs are blind — same code for symphony and monster trucks." |
| 4 | "MCCs can't see patterns — three ski purchases, three generic codes." |
| 5 | "Patterns can't extend — no demographics, no actionable offers." |

### Collapsed Card Style
- Small white card with light border (`#E2E8F0`), slight shadow
- One line of text in `text-sm font-medium` gray
- Stacked with `margin-top: -4px` or similar overlap to create a deck effect
- Opacity ~0.5 for older cards, ~0.7 for most recent
- Transition in with scale-down animation when a beat gets replaced

### Active Beat
- Centered vertically and horizontally in remaining space
- Full content with all visuals/animations as currently implemented
- No `mt-16` or `mt-8` margins between beats — only the active one renders full-size

### Implementation
- Refactor `beatOpacity`/`beatTransform` into a two-mode render: collapsed (past) vs active (current) vs hidden (future)
- Past beats render a simplified `<div>` with just the summary line
- Active beat renders the full existing content
- The `goBack` function re-expands a collapsed card back to active

### File
| File | Action |
|---|---|
| `src/components/demo/DemoPasswordGate.tsx` | Refactor layout to centered-active + stacked collapsed cards |

