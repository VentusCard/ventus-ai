# Force the editor overlay text to actually paint

Probing the running editor shows the `<pre>` overlay has the correct `color: rgb(15,23,42)`, the correct font, the right inner HTML, and a 1199×182 bounding box — but the box paints blank. That signature only happens when `-webkit-text-fill-color` is overriding the inherited `color`. Some rule in the cascade (most likely a global `pre`/`code` reset or a Tailwind base) is leaving the pre's fill color at `transparent` or `currentColor` that resolves wrong.

`color` is what we set; `-webkit-text-fill-color` is what actually paints. We need to force both.

## Fix

In `src/components/tepilot/insights/query/QueryEditor.tsx`, on the `<pre>` overlay:

- Inline style becomes `{ color: "#0f172a", WebkitTextFillColor: "#0f172a" }` — wins over any cascading rule.
- Each colored `<span>` already has a Tailwind text color class (`text-blue-600`, `text-emerald-600`, `text-violet-600`, `text-amber-600`, `text-slate-400`). Some of those may also be bleached by the same cascade rule, so also inline `-webkit-text-fill-color: currentColor` on the spans via a small wrapper: change the `highlight()` helper to emit `style="-webkit-text-fill-color:currentColor"` alongside the existing class. This makes every colored token paint at whatever color its class resolves to.
- Leave the `<textarea>` exactly as is (it stays `-webkit-text-fill-color: transparent` so the caret-only input layer remains invisible).

No other files, no engine or business-logic changes.

## Verify

After the edit, drive Playwright to `/bankdemo` → Analytics → Query and screenshot:
1. The default query (`-- Daily transaction volume…`) — confirm comment, `SELECT`, `day`, `COUNT`, `transactions`, numbers, and identifiers are all readable.
2. The "Deal redemptions × segment" example — confirm the multi-line JOIN query top is no longer blank.

Inspect computed `-webkit-text-fill-color` of the `<pre>` to confirm it is `rgb(15, 23, 42)`.
