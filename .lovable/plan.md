

## Upgrade Win-Back Recommendations Cards

The current cards are minimal — each has a competitor name, a single-line detected pattern, behavioral context, recommended action, segment tags, and an estimated recapture figure. The goal is to make them richer, more visually polished, and more detailed.

### Changes

**1. Expand the data model** (`src/types/bankwide.ts`)
Add new fields to `WinBackRecommendation`:
- `outflowVolume: number` — estimated dollar volume flowing to this competitor
- `avgTransferAmount: number` — per-customer average
- `topPersona: string` — dominant TEpilot persona archetype
- `timeToAction: string` — urgency window (e.g. "Act within 30 days")
- `channelStrategy: string[]` — recommended channels (e.g. ["In-App", "Email", "Branch"])
- `successMetric: string` — how to measure win-back (e.g. "Deposit return within 60 days")
- `trend: 'growing' | 'stable' | 'declining'` — outflow trend direction

**2. Enrich the mock data** (`src/lib/mockBankwideData.ts`)
Populate all 7 existing win-back entries with the new fields — realistic values for each competitor.

**3. Redesign the card component** (`src/components/tepilot/insights/WinBackRecommendations.tsx`)
- **Larger card header** — bigger competitor name, icon with competitor-type color coding, confidence badge + trend indicator arrow
- **Metrics row** — 3-column mini-stat bar: Affected Customers | Est. Outflow Volume | Avg Transfer per Customer
- **Detected Pattern** section — keep red-tinted box but increase text size
- **Why They're Leaving** section — add "Top Persona" badge inline
- **Recommended Action** section — keep green box, add channel strategy chips below it
- **Urgency & Success** row — "Act within X days" badge + success metric text
- **Footer** — segment tags + estimated recapture value (keep existing)
- Increase overall text sizes (xs → sm where appropriate) and padding for readability

### Technical details

- 3 files modified: `types/bankwide.ts`, `mockBankwideData.ts`, `WinBackRecommendations.tsx`
- No new dependencies
- Grid stays `grid-cols-1 lg:grid-cols-2` but cards will be taller with richer content

