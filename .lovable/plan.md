

## Add Subtitle Lines to Smart Rewards and Relationship Intelligence Cards

Add a one-line description beneath the title of the **Smart Rewards** and **Relationship Intelligence** cards in the hero animation.

### Data Changes

**File: `src/components/hero/EnrichmentMockup.tsx`**

1. Add a `subtitle` field to the `IntelCard` interface.

2. For all three customer profiles, add subtitles to the relevant cards:

| Card | Subtitle |
|------|----------|
| Smart Rewards | Hyper-personalized ranking and messages |
| Relationship Intelligence | Personalized projections, timeline and meeting prep |

Analytics Intelligence and Dynamic Persona cards remain unchanged (no subtitle).

### Rendering Change

In the right panel's intelligence card rendering (around line 597-605), after the title row, render `card.subtitle` as a small muted line when present:

```text
[icon] SMART REWARDS
Hyper-personalized ranking and messages
[pills...]
```

Style: `text-[8px] text-gray-500 mb-1` -- subtle, doesn't compete with the title or pills.

### Summary of Edits

- **1 file**: `src/components/hero/EnrichmentMockup.tsx`
- Add `subtitle?: string` to `IntelCard` interface
- Add subtitle strings to 6 card entries (2 cards x 3 customers)
- Add 3 lines of JSX to render the subtitle below the card title

