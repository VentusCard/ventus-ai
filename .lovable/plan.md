## Fix broken System diagram layout

**Root cause**: Inside the Core card, the inner `grid grid-cols-[1fr_24px_1fr]` has two button columns with long labels (e.g. "Next-Conversation · Wealth"). The buttons use `flex-1 truncate` on the span, but the button and column wrappers are missing `min-w-0`. So `truncate` doesn't kick in, the columns expand to their min-content, the Core card overflows, and the right Destinations column gets pushed out of the row — causing it to wrap underneath the Sources column (which is why CRM / Rewards Provider / Digital Banking App appear duplicated at the bottom-left in the screenshot).

### Changes in `src/components/tepilot/insights/CapabilitiesView.tsx`

1. **Constrain the inner two columns** so labels truncate instead of forcing the card wider:
   - Add `min-w-0` to each inner column wrapper (Signals column `div`, Applications column `div`).
   - Add `min-w-0 w-full` to each `<button>` in both `SIGNALS.map` and `APPLICATIONS.map`.
   - Keep `flex-1 truncate` on the label span (already present).

2. **Rebalance the outer 3-column grid** so the Core card doesn't crowd the side columns at 1280–1500px widths:
   - Change both occurrences of `grid-cols-[240px_minmax(440px,1fr)_240px]` to `grid-cols-[220px_minmax(380px,1fr)_220px]`.
   - Reduce gap from `gap-8` to `gap-6`.

3. **Tighten the inner band gap** so Signals/Applications don't visually collide with the fan SVG:
   - Change the inner `grid-cols-[1fr_24px_1fr] gap-0` to `grid-cols-[1fr_32px_1fr] gap-1`.

4. **Guard against overflow** on the Core card itself:
   - Add `overflow-hidden` to the Core card container `div` (line 610).

No changes to signal/application data, destinations, sources, or detail panel logic.
