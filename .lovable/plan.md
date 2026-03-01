

# Align Sparkline Bar Graphs Across Pillar Cards

## Problem
The mini sparkline bar graphs at the bottom of each pillar card are not vertically aligned across the grid. This happens because cards have different content heights -- some pillar names wrap to two lines, the Travel card has an extra trip summary line, and budget mode adds variable content. The sparklines just sit at the end of each card's content flow, so they end up at different vertical positions.

## Solution
Use flexbox to push the sparklines to the bottom of every card, regardless of content height above them.

### Changes in `src/components/tepilot/insights/PillarExplorer.tsx`

1. **Make the card content a flex column with full height**: Change the `space-y-3` wrapper inside `CardContent` to `flex flex-col h-full` with gaps
2. **Add `flex-grow` spacer before the sparkline**: Insert a `flex-grow` div (or apply `mt-auto` to the sparkline container) so the sparkline is always pushed to the bottom of the card
3. **Set a consistent card height**: Ensure the Card itself stretches to fill the grid row height (the grid already handles this with implicit equal-height rows, but the inner content needs to fill it too). Set `h-full` on the Card and `h-full` on `CardContent`

### Visual result

```text
Before:                          After:
+----------+ +----------+       +----------+ +----------+
| Dining   | | Travel   |       | Dining   | | Travel   |
| $500     | | $2,450   |       | $500     | | $2,450   |
| 12 · 8%  | | 42 · 18% |       | 12 · 8%  | | 42 · 18% |
| ▂▅▃▇▄▆▂▅ | | 3 Trips  |       |          | | 3 Trips  |
+----------+ | ▂▅▃▇▄▆▂▅ |       | ▂▅▃▇▄▆▂▅ | | ▂▅▃▇▄▆▂▅ |
             +----------+       +----------+ +----------+
```

All sparklines sit at the same vertical position at the card bottom.

