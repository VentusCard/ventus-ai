## Goal
Make the AI Assistant Activity tab feel more narrated and less synthetic by (1) adding a Ventus AI "key insight" callout above the 4 KPI tiles, and (2) replacing the perfectly monotonic sparkline series with more naturally noisy data while preserving each topic's overall 7-day direction.

## 1. Ventus AI key insight banner (new)

In `src/components/tepilot/insights/AIAssistantActivityView.tsx`, render a new card directly above the KPI grid (between `<TabHeader />` and the `grid grid-cols-4` KPI strip).

Visual treatment — match existing Ventus AI accents on the dashboard (strict light theme):
- Container: `rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-white px-4 py-3 flex items-start gap-3`
- Left icon chip: small rounded square with `Sparkles` lucide icon, blue-600 on blue-100 background
- Label: `VENTUS AI · KEY INSIGHT` in 10px uppercase tracked blue-700 semibold
- Headline (one line, ~14px slate-900 semibold): e.g. _"Travel & life-event questions are driving this week's volume spike."_
- Sub-line (12px slate-600): a two-sentence read that names the top movers using the numbers already in `TRENDING_TOPICS`, e.g. _"Holiday travel planning (+58%) and Ski trip recaps (+42%) led 24h growth. First-home buying resources crossed 2.8k conversations — the highest of any life-event topic this quarter."_
- Right side: small "Updated 2 min ago" timestamp in slate-400, plus a thin vertical divider before it.

Copy is static for now (hardcoded in the component) — no new data file needed. Wording will follow project memory rules: vaguely specific, no exact transaction counts/dollar amounts, no risk/stress framing.

## 2. Randomize sparkline trends

In `src/lib/aiAssistantActivityData.ts`, replace each topic's `spark: number[]` with a more naturally noisy 7-point series. Rules:
- Keep length = 7
- Preserve overall direction: last point should be higher than first when `deltaPct > 0`, lower when `< 0`, roughly flat when near 0
- Magnitude of change between first and last point should be proportional to `deltaPct`
- Add per-step jitter (±10–25% of the local value) so the line zig-zags rather than climbing perfectly monotonically — including occasional dips inside an uptrend and bumps inside a downtrend
- Values stay positive integers
- Each topic gets a distinct shape (different jitter pattern) so the trend column looks varied across rows

Hand-author 10 new series (one per topic) rather than computing at runtime, to keep render deterministic and avoid touching the `Sparkline` component.

## 3. Out of scope
- No changes to `Sparkline`, `KpiTile`, `DeltaPill`, intent mix, trending topics table layout, or the iPad mockup
- No changes to navigation, routing, or `ConsumerAIChatView`
- No new types or exports beyond what's already in `aiAssistantActivityData.ts`

## Files touched
- `src/components/tepilot/insights/AIAssistantActivityView.tsx` — add insight banner above KPI grid; import `Sparkles` from lucide
- `src/lib/aiAssistantActivityData.ts` — rewrite the `spark` arrays on all 10 `TRENDING_TOPICS`
