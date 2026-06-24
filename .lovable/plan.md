# Fix invisible SQL text in the Query editor

The `<pre>` overlay relies on `text-slate-800` for identifiers and unstyled tokens, but on the user's preview those characters render white (or near-white), leaving only the colored keywords/numbers visible.

## Change

In `src/components/tepilot/insights/query/QueryEditor.tsx`:

- Drop the Tailwind `text-slate-800` class on the `<pre>` overlay and set the color via an inline style so no global rule can override it: `style={{ color: "#0f172a" }}` (slate-900). Inline styles win over any cascading rule from `index.css` or parent containers.
- Force the same color on the textarea's caret with `caret-slate-900` (already present) and on the textarea's selection background by adding `selection:bg-blue-200 selection:text-slate-900` so selected text stays legible.
- Add `color: "#0f172a"` to the parent flex wrapper too, so any token that isn't wrapped in a colored span still inherits a dark color.
- Keep the textarea text transparent (it's the invisible input layer); the `<pre>` is the visible layer.

No other components, no business logic, no engine changes.

## Verify

After the edit, drive Playwright to `/bankdemo` → Analytics → Query, screenshot the editor, and confirm the full default query is readable in dark slate including identifiers like `day`, `transactions`, and `customer_id`.
