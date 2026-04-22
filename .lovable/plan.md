

## Add "action" sub-bubbles connected to each persona callout

Each persona callout (Leisure Traveler, Young Parent, College-Bound Child) will get a second smaller bubble attached just below it, connected by a short vertical dashed line. This sub-bubble shows what the bank can *do* with that insight — turning each callout from a label into an insight → action pair.

### Visual structure (per persona)

```text
 ┌─────────────────────────┐
 │ ✈ Leisure Traveler      │   ← existing label bubble
 └────────────┬────────────┘
              ┊                  ← short vertical dashed line (animated)
 ┌────────────┴────────────┐
 │ ⚡ Action                │   ← new sub-bubble (smaller, lighter)
 │ Send noise-cancelling   │
 │ headphone offer + lounge│
 │ access upsell           │
 └─────────────────────────┘
```

Both bubbles share the persona color. The label bubble keeps its current solid-ish look; the action bubble is one tone lighter (more transparent background, dashed border) so it reads as a downstream effect, not a peer.

### Action copy per persona

- **Leisure Traveler** — "Trigger pre-trip offer flow: noise-cancelling headphones, lounge pass, FX-free card upsell"
- **Young Parent** — "Activate family financial flow: 529 plan nudge, life insurance review, kids' debit card invite"
- **College-Bound Child** — "Standard clients: automated 529 / HYSA flow. Wealth clients: automated flow + AI-assisted advisor prep"

(Final copy can be tightened during implementation — these are the directional messages.)

### Layout adjustments

- Each callout becomes a **vertical stack** (label bubble on top, connector line, action bubble on bottom) instead of a single bubble.
- The horizontal dashed connector from each stack to the card stays as-is (still anchors the persona to its rows in the card).
- Top offsets for the three callouts will be re-spaced so the taller stacks don't overlap:
  - Travel: `top: 20`
  - Parent: `top: 230`
  - College (right side): `top: 60`
- Action bubble width matches label bubble (~210px) so the vertical connector lines up cleanly.
- All sub-bubbles fade/slide in together with their parent callout (same `isActive` gate, no extra timing logic).

### Styling

- **Label bubble** (unchanged): `bg = color @ 4% alpha`, `border = color @ 25% alpha`, bold persona name.
- **Action bubble** (new): `bg = color @ 3% alpha`, `border = 1px dashed color @ 30%`, smaller 11px text, prefixed with a small ⚡ icon in persona color, body text in `text-gray-700`.
- **Vertical connector**: 2px wide, ~14px tall, dashed line in persona color at 50% opacity, matching the existing horizontal connector style.

### File touched

- `src/components/ScrollDrivenHero.tsx` — only the persona callouts `.map()` block (~lines 270–370). Wrap each side's content in a vertical flex column containing `[label bubble] → [vertical dashed line] → [action bubble]`, and update the three `top` offsets.

No new components, no data model changes, no scroll-timing changes.

