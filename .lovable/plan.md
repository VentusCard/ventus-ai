# Merge Dashboard + Ask Ventus AI into "Ventus AI Dashboard" (Leadership View)

Combine the Analytics → **Dashboard** and Analytics → **Ask Ventus AI** tabs in `/bankdemo` into a single tab called **Ventus AI Dashboard**, framed for bank leadership (CEO / Chief Retail / Chief Data). Dashboard sits on top; a compact chat sits below.

## Layout

Vertical stack inside the tab area:

```text
┌─────────────────────────────────────────────┐
│ Ventus AI Dashboard — Leadership View       │
│                                             │
│  [ Analyst dashboard content — flex-1 ]     │
│                                             │
├─────────────────────────────────────────────┤
│ Ventus AI · Ask about your book  [chips]    │
│ [ chat transcript — max-h ~220px, scrolls ] │
│ [ input row ]                               │
└─────────────────────────────────────────────┘
```

- Top region: `flex-1`, scrolls internally, renders the leadership-oriented dashboard.
- Bottom region: fixed height ~320px total (transcript capped ~200–220px + header + input), never dominates the screen. Not full-height.

## Changes

### 1. `src/components/tepilot/insights/AnalyticsContainer.tsx`
- In the Analytics nav group, replace the two entries `analytics-dashboard` ("Dashboard") and `ventus-ai` ("Ask Ventus AI") with one:
  - `value: "ventus-ai-dashboard"`, `label: "Ventus AI Dashboard"`, icon: existing bold "V" glyph.
- Add `'ventus-ai-dashboard'` to `TabValue`. Keep `'ventus-ai'` and `'analytics-dashboard'` in the union as aliases so existing `onNavigate(...)` calls still work.
- In `renderContent`, route `ventus-ai-dashboard`, `ventus-ai`, and `analytics-dashboard` all to `<VentusAIDashboardView onNavigate={setActiveTab} />`.
- On `ventus-ai-dashboard`, hide the floating right-rail chat toggle (chat is inline).

### 2. New file: `src/components/tepilot/insights/VentusAIDashboardView.tsx`
- Vertical flex layout as above.
- Top: renders existing `<AnalystDashboardView onNavigate={onNavigate} />` unchanged (already the analytics summary view).
- Bottom: new compact `VentusLeadershipChat` block:
  - Uses `useAdvisorChat({ functionName: "bankwide-chat", advisorContext })`.
  - `advisorContext` framed for leadership: role = "Ventus AI briefing analyst for bank executive leadership", audience = "CEO, Chief Retail Officer, Chief Data Officer, Head of Wealth". Keep the existing `PLATFORM_CONTEXT` bankwide metrics/hot trends already used by `VentusAIChatPanel`.
  - Empty state shows a short line ("Ask about your book — bankwide metrics, growth pillars, outflow, life-event signals") plus 4 leadership-oriented quick-action chips, e.g. "Where are we losing deposits?", "Top growth pillars this quarter", "Which segments need a leadership brief?", "Biggest cross-sell opportunities".
  - Transcript container: `max-h-[220px] overflow-y-auto`, markdown rendering, same message bubble styling as the current `VentusAIChatPanel`.
  - Input row identical in behavior to the current panel (Enter to send, disabled while loading, Send button).
  - No close button, no left border (it's inline, not a rail).

### 3. Existing `VentusAIChatPanel` overlay
- Unchanged for other tabs. Only hidden on the merged tab as noted above.

### 4. Cleanup
- Remove now-unused `LayoutDashboard` icon import if no longer referenced.
- Leave `VentusAIWelcomeView` file in place unless a grep confirms zero remaining references, in which case delete.

## Leadership framing details
- Header above the chat reads: **"Ventus AI · Leadership briefing"** with subtitle "Ask the co-pilot about your bankwide book."
- System context sent to `bankwide-chat` explicitly instructs concise, executive-tone answers (2–4 bullet points, no code, quantify with the platform metrics already provided).

## Out of scope
- No changes to `AnalystDashboardView` internals, chart data, or the `bankwide-chat` edge function itself (only the `context` payload wording changes).
- No new persistence, no thread history.
- No changes to other tabs or the floating overlay on other tabs.

## Verification
- `tsc --noEmit` clean.
- `/bankdemo` → Analytics shows single "Ventus AI Dashboard" item.
- Selecting it shows dashboard on top and a short (~⅓-height-or-less) chat block underneath; transcript scrolls within its own box; sending a message returns a response; quick-action chips populate the input and send.
- Other tabs and the floating chat rail behavior are unchanged.
