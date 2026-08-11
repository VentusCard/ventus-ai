Apply a gradient border to the global header omnibox ("Ask Ventus AI or search…") in the `/bankdemo` workspace so it visually signals an AI-powered smart search.

Scope
- File: `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Target: the search input rendered at lines 573–590 (omnibox with `ventus-ai-live-dot` inside).
- No functional changes; only styling and no effect on the dropdown behavior or green live dot.

Implementation plan
1. Wrap the existing `<input>` in a new container that provides the gradient border.
   - Use a `rounded-md` wrapper with `p-[1px]` and a `bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400` (or similar AI-themed gradient) as its background.
   - Place the `<input>` inside with a `bg-slate-50` background so only the 1px outer ring shows the gradient.
2. Preserve the current `ventus-ai-live-dot` positioning and the `focus:ring` behavior.
   - The dot can remain absolute inside the wrapper, sitting on the gradient border is fine; or keep it just inside the input as it is now.
3. Adjust the input’s own border to `border-none` or `border-transparent` so the gradient border is the only visible outline.
4. Add a subtle hover/focus enhancement (e.g., wrapper shadow or a slightly brighter gradient) so the smart-search affordance is clear.
5. Verify the dropdown still opens and the layout stays at `h-8` / `w-72` in the global header.

Acceptance
- The omnibox shows a continuous color-gradient border around the input field.
- The live green dot, placeholder, and search dropdown still work identically.
- The rest of the page header and sidebar are unchanged.