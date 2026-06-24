## Fix: SQL editor selection looks weird

**Problem:** When you select text in the SQL editor, the selection looks off because two layers are involved:
- The `<textarea>` (invisible text) paints a strong blue selection background (`bg-blue-200`) under your cursor.
- The `<pre>` overlay sitting on top shows the colored, syntax-highlighted characters — but those characters are *not* selected, so they keep their normal blue/violet/amber colors on top of the blue selection band. The result clashes and looks broken.

**Fix (UI only, single file):** `src/components/tepilot/insights/query/QueryEditor.tsx`

1. Soften the textarea selection background from `bg-blue-200` to a lighter neutral (`bg-slate-200/70`) so it reads as a calm highlight band instead of a saturated blue stripe.
2. Add a matching `::selection` style on the `<pre>` overlay (via a small scoped `<style>` block or a `[&_*::selection]` Tailwind arbitrary variant) so the colored tokens above the selection also get the same `bg-slate-200/70` highlight and a unified `#0f172a` text fill. This makes the highlight look like one continuous selection instead of two mismatched layers.
3. Keep everything else (token colors, transparent textarea text, z-index stacking) unchanged.

**Verification:** Drive Playwright to `/bankdemo` → Analytics → Query, select a range of SQL with mouse drag, screenshot, and confirm the selected text reads cleanly against a soft slate band with no blue/colored clashing.

No engine, data, or business-logic changes.