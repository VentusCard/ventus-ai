
## Goal

On `/bankdemo` → Analytics → **Ventus AI Dashboard**, replace the current bottom chat block with:

1. A **sliver card** rendered directly below the 3 priority cards inside `AnalystDashboardView`.
2. When the user sends the first message (or focuses + types), the chat **expands into a full-screen overlay** on top of the dashboard.
3. Reuse the **original gradient** from `VentusAIWelcomeView` (`bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900`) for the chat surface header.

## Changes

### 1. `VentusAIDashboardView.tsx` (rewrite layout)
- Remove the bottom chat panel and the outer flex column split.
- Render `<AnalystDashboardView onNavigate={onNavigate} />` full-height as before.
- Own the chat state (`messages`, `isLoading`, `sendMessage`, `input`) via `useAdvisorChat` at this level so it persists across sliver ↔ full-screen transitions.
- Pass a render-prop / context down to `AnalystDashboardView` so the sliver renders inline right after the priority cards. Simplest: pass `renderVentusSliver: () => ReactNode` as an optional prop.
- Render a full-screen overlay (`fixed inset-0 z-50`) with the dark gradient hero when `expanded === true` (auto-set to true once `messages.length > 0`, or when the user clicks the sliver / focuses input). Include a close (collapse) button that returns to sliver but keeps the transcript.

### 2. `AnalystDashboardView.tsx`
- Accept new optional prop `renderVentusSliver?: () => ReactNode`.
- Locate the 3 priority cards block and render `{renderVentusSliver?.()}` immediately after it (same container width).

### 3. Sliver card design
- Compact single row: gradient-tinted background (subtle light variant), "V" glyph, title "Ask Ventus AI", a short prompt input placeholder ("Ask about your bankwide book…"), and 2–3 quick-action chips.
- Clicking input / chip / Enter triggers expansion + sends the message.
- Height ~64–72px, rounded, border `border-slate-200`.

### 4. Full-screen chat overlay
- Uses the original hero gradient `bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900` for the top band with the "V" avatar and leadership subtitle.
- Below the hero, white chat container with transcript, markdown rendering, quick actions (only when empty), input, send button, loading indicator — reusing the existing markup patterns already in `VentusAIDashboardView`.
- Close/minimize button (top-right) collapses back to sliver; ESC also collapses.
- `LEADERSHIP_CONTEXT` and `QUICK_ACTIONS` stay unchanged.

### 5. Cleanup
- Remove the now-unused bottom-panel styling from `VentusAIDashboardView`.
- `AnalyticsContainer.tsx` unchanged.

## Out of scope

- Dashboard content, chart data, `bankwide-chat` edge function, floating chat rail on other tabs, persistence of chat between navigations.

## Verification

- `tsc --noEmit` clean.
- `/bankdemo` → Analytics → Ventus AI Dashboard: dashboard renders; a sliver card sits directly under the 3 priority cards; clicking/typing expands to a full-screen chat with dark→blue gradient header; close button returns to sliver with transcript preserved; other tabs unaffected.
