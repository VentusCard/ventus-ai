

## Plan: Scrollable transaction feed + hover tooltip

### Changes in `src/components/exec-demo/ExecDemoLeftPanel.tsx`

**1. Make the "hold" phase transaction list scrollable**
- The `showCollected` block (line 218-261) currently renders inside a `div` with no overflow scroll. Wrap it (and the idle phase list) with `overflow-y-auto` so users can scroll through all transactions.
- The container at line 167 already has `flex-1 min-h-0` but uses `overflow-hidden`. For the hold/idle phases, allow `overflow-y-auto` on the inner content div.

**2. Add hover tooltip on each transaction row**
- Use a CSS-only tooltip or a lightweight `group/hover` approach (no new dependency needed).
- On hover, show a small floating bubble below/beside the row displaying enrichment metadata from `signalMap`: **pillar**, **label** (subcategory), **frequency**, and **amount**.
- Add a `signalEntry` prop to `TxRow`, and render a hidden tooltip div that appears on hover using Tailwind `group-hover` classes.
- The tooltip will be a compact dark chip (e.g., `bg-slate-800 text-white text-[9px] rounded px-2 py-1`) positioned absolutely below the row.

### Files modified
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` only

