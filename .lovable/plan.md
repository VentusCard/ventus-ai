## Wrap result actions in a card, move to bottom of page

In `QueryConsoleView.tsx`, the four-button action row (`ResultActionsBar`) currently sits directly above the chart with no container. Wrap it in a card that matches the other cards on the Query tab (toolbar, AI refine, error banner — all `rounded-md border border-slate-200 bg-white`), and move the whole block to the very end of the page, after the result table.

### New layout order (when a result exists)

1. Chart (if any)
2. Result table (`ReportDataTable`)
3. **New "What's next?" card** containing:
   - Left: small label `WHAT'S NEXT` (uppercase tracking-wider, slate-400) + one-line helper "Summarize, export, or share this result."
   - Right: `ResultActionsBar` (the existing 4 buttons, unchanged)
   - On a single row at desktop widths, stacks on narrow screens.
4. **`TakeawayPanel`** (when open) renders directly under the card so the AI summary appears in context.

### Card styling

Match the toolbar/refine cards already on the page:

```
rounded-md border border-slate-200 bg-white px-3.5 py-3
```

Inner layout:

```
<div className="flex items-center justify-between gap-3 flex-wrap">
  <div className="min-w-0">
    <div className="text-[10.5px] uppercase tracking-wider font-semibold text-slate-400">What's next</div>
    <div className="text-[12.5px] text-slate-600">Summarize, export, or email this result.</div>
  </div>
  <ResultActionsBar ... />
</div>
```

### File touched

- `src/components/tepilot/insights/QueryConsoleView.tsx` — reorder the `{result && ...}` JSX block and add the wrapper card. No prop or behavior changes elsewhere.

No changes to `ResultActionsBar`, `TakeawayPanel`, `EmailResultDialog`, the SQL engine, or any edge function.
