## Goal
Give the insights column more breathing room and let users slice the Trending Topics table by intent.

## 1. Widen the left column
In `src/components/tepilot/insights/AIAssistantActivityView.tsx`:
- Change the main split from `grid-cols-12` `col-span-7 / col-span-5` → `col-span-8 / col-span-4`.
- iPad mockup wrapper stays capped at `maxWidth: 380` and is centered, so the narrower right column doesn't clip the device — it just sits closer to its natural width.
- Trending Topics column template stays `[1fr_90px_70px_80px]`; the extra width flows into the Topic column (longer sample questions get fewer truncations).

## 2. Trending Topics filters
Add a filter row inside the Trending Topics card header (just under the existing title row, above the column headers).

Behavior:
- 5 pill buttons in a single row: `All` + one per intent (`Spend recap`, `Resource request`, `Life event`, `Product question`), using each intent's `INTENT_META` color for the active state (light tinted bg + colored text + colored border), and neutral slate for inactive.
- Each pill shows the matching count, e.g. `Life event · 3`.
- Local state `intentFilter: TopicIntent | "all"` (default `"all"`). Filter `TRENDING_TOPICS` before rendering rows.
- Empty state: if a filter yields no rows (won't happen with current data but defensive), show a small slate-500 row "No topics in this intent".
- Selecting a filter does NOT change the iPad mockup's active topic. If the currently-playing topic is filtered out, keep playing it; the "Playing" badge simply won't appear in the visible list.
- Auto-rotation: keep cycling through the FULL `TRENDING_TOPICS` (filter is purely visual). This preserves the demo's narrative flow.

Optional secondary filter (include): a tiny right-aligned sort toggle `Vol ▾ / Δ 7d ▾` (two text buttons, default `Vol`). Sorting applies to the filtered list, descending. Keep it lightweight — no dropdown component.

## 3. Out of scope
- Intent Mix card, KPI strip, Ventus AI insight banner, iPad mockup internals, data file, navigation — all unchanged.

## Files touched
- `src/components/tepilot/insights/AIAssistantActivityView.tsx` only.
