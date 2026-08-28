# Subdue the top-right search bar in /bankdemo

## Goal
Reduce the visual prominence of the "Ask Ventus AI or search…" omnibox in the top-right corner of the /bankdemo header so it stops pulling attention away from the page content.

## Current state
- The omnibox lives in `src/components/tepilot/insights/AnalyticsContainer.tsx` around line 589.
- It currently uses a thick, vibrant `bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400` wrapper with a strong focus glow (`focus-within:shadow-[...]`).
- A pulsing `.ventus-ai-live-dot` sits inside the field, adding extra visual energy.

## Proposed change
1. Replace the loud gradient wrapper with a thin, muted border treatment:
   - `border border-slate-200` by default, possibly `border-slate-300` on focus.
   - Remove the multi-color gradient or reduce it to a very subtle single-tone hint if a brand accent is desired.
2. Soften the focus state:
   - Replace the large colored glow with a minimal ring or a faint shadow (`ring-1 ring-blue-400/30` or `shadow-sm`).
3. Keep the live dot but make it less prominent (smaller, lower-saturation color) so it still signals AI readiness without competing with page content.
4. Preserve the existing width, behavior, dropdown, and keyboard shortcuts.

## Acceptance
- The search bar no longer looks like a highlighted CTA.
- It still reads clearly as an input and retains focus/interaction affordances.
- No functional regressions in search, AI ask, or tab navigation.
