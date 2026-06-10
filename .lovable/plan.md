## Make AI Assistant Activity insights-driven

Refocus the left side of `src/components/tepilot/insights/AIAssistantActivityView.tsx` on real numbers, deltas, and trend visuals. Drop the Live Conversation Stream card. The iPad mockup on the right stays as-is.

### Layout after change

```text
┌──────────────────────────────────────────────────────────────┐
│ TabHeader: "AI Assistant Activity"                           │
├──────────────────────────────────────────────────────────────┤
│ KPI strip (4 tiles, with deltas)                             │
│  • Conversations / 24h   12,480   ↑ 18% WoW                  │
│  • Avg. msgs per chat    4.6      ↑ 0.3                      │
│  • Self-serve resolution 81%      ↑ 4 pts                    │
│  • Avg. response time    1.4s     ↓ 0.2s                     │
├──────────────────────┬───────────────────────────────────────┤
│ LEFT (col-span-7)    │ RIGHT (col-span-5) — iPad (unchanged) │
│                      │                                       │
│ Intent Mix (24h)     │                                       │
│  horizontal bar:     │                                       │
│  Spend recap   38%   │                                       │
│  Resource req  24%   │                                       │
│  Life event    21%   │                                       │
│  Product Q     17%   │                                       │
│                      │                                       │
│ Trending Topics      │                                       │
│  (table-style rows;  │                                       │
│  click to play)      │                                       │
│  Topic │ Vol │ Δ7d │ │                                       │
│  Intent│ Spark line  │                                       │
│  ...10 rows          │                                       │
└──────────────────────┴───────────────────────────────────────┘
```

### Changes

1. **Remove** the entire "Live conversation stream" card and the `LIVE_QUESTION_FEED`-driven rotation effect/state (`feedIdx`, `feedItems`, the `setInterval`).
2. **KPI strip**: replace vague phrases ("Trending higher", "Multi-turn", etc.) with concrete numbers + delta chips. 4 tiles:
   - Conversations (24h): `12,480` · `↑ 18% WoW` (green)
   - Avg. messages per chat: `4.6` · `↑ 0.3` (green)
   - Self-serve resolution: `81%` · `↑ 4 pts` (green)
   - Avg. assistant response: `1.4s` · `↓ 0.2s` (green)
   Each tile shows label (uppercase), large bold value, and a colored delta pill with up/down arrow.
3. **New "Intent Mix (last 24h)" card** above Trending Topics: a stacked-bar legend with four intent categories (Spend recap, Resource request, Life event, Product question), each with a colored bar, %, and count. Reuses `INTENT_META` colors.
4. **Trending Topics — insights-ified**: each row now shows
   - Emoji + label + intent tag + active "Playing" badge
   - **Volume number** (e.g. `3,240 chats`)
   - **7-day delta** as a colored pill (e.g. `↑ 42%` green, `↓ 6%` red, `→ flat` slate)
   - **Tiny inline sparkline** (7 points) rendered as an SVG polyline
   - One-line sample question (kept, italic, truncated)
   Replace `volumeBlurb` / `deltaBlurb` strings with structured numeric fields.
5. **Data update** in `src/lib/aiAssistantActivityData.ts`:
   - Add to `TrendingTopic`: `volume: number; deltaPct: number; spark: number[];` (7 values for the sparkline).
   - Seed each of the 10 topics with realistic numbers (volumes between ~400 and ~3,500; deltas between -10% and +60%; sparklines roughly matching delta direction).
   - Remove `LIVE_QUESTION_FEED` export (no longer used).
   - Keep `volumeBlurb` / `deltaBlurb` fields removed; the structured numbers replace them.

### Notes

- These numbers are internal banker-facing analytics, so concrete counts/percentages are appropriate. Memory's "vaguely specific" rule applies to customer-facing AI copy, not the internal dashboard — same convention as the other Analytics tabs (Wallet Share, Subscription Analytics, etc.) which all show hard numbers.
- Sparklines are tiny SVG polylines (~60×16) auto-scaled to each topic's series — no chart library needed.
- iPad mockup, topic selection behavior, auto-rotation, pause/resume — all unchanged.
- Strict light theme; no `dark:` utilities.
