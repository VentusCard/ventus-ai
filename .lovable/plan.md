

## Better ranking of Rewards phone mockup sections

The current order feels slightly random. A more natural flow would prioritize urgency and personalization at the top, then contextual/ambient features, then browsing.

### Proposed order (top to bottom)

```text
1. Savings Summary Bar       — greeting + progress (anchor)
2. Top Pick For You          — strongest personal signal, immediate action
3. Expiring Soon             — urgency, time-sensitive
4. Location Experience       — contextual/ambient, "you're here now"
5. Collection Carousel       — browsable lifestyle categories
6. Semantic Search           — moved to bottom as a utility/fallback
```

### Rationale
- **Top Pick** rises above Expiring — it's the single best recommendation, should be the first thing after the greeting.
- **Search** moves to the bottom — power users scroll down to find it; casual users engage with curated content first. This mirrors how modern reward apps (e.g., Chase Offers, Amex) bury search below featured content.
- **Location Experience** stays between urgency and browsing — it's contextual but not time-critical.

### Change
Single file: `src/components/exec-demo/GeneratedOffersPhoneView.tsx` — reorder the JSX blocks within the `space-y-2.5` container (~lines 240–470). No logic changes, just move the blocks.

