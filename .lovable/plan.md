

## Keep transaction panel full-width until the phone mockup opens

**Problem:** Right now the left-hand Transaction Feed shrinks to a 40px vertical sliver the moment any Intelligence Panel tab (Analytics / Rewards / Product / Relationship) is clicked. You want it to stay at full width (400px) all the way until the phone mockup actually appears — i.e. until the user clicks "Open AI Banking Assistant" inside the Relationship tab.

**Root cause:** In `src/pages/ExecDemoPage.tsx` the txn column width is bound to `activeTab`:

```tsx
width: activeTab ? (txPanelExpanded ? 400 : 40) : 400
```

The phone, however, only appears when `phoneVisible = activeTab === "relationship" && aiTabTrigger > 0`. So the panel collapses well before the phone is shown.

### Change

Bind the txn-panel collapse to `phoneVisible` instead of `activeTab`:

1. Compute `phoneVisible` once at the top of the JSX (it's currently computed inside the Col 3 IIFE — lift it so Col 1 can read it too).
2. Update Col 1's width / sliver / full-panel conditions to use `phoneVisible` everywhere `activeTab` was used as a "phone is taking space" proxy:
   - `width: phoneVisible ? (txPanelExpanded ? 400 : 40) : 400`
   - `minWidth` mirrors width
   - `overflow: phoneVisible && !txPanelExpanded ? "visible" : "hidden"`
   - Sliver render guard: `{phoneVisible && !txPanelExpanded && (...)}`
   - Full panel render guard: `{(!phoneVisible || txPanelExpanded) && (...)}`
   - Collapse button guard: `{phoneVisible && txPanelExpanded && (...)}`

That's the entire change — single file, one column's width logic.

### Resulting flow

1. Run Semantic Enrichment → txn panel stays full 400px.
2. Click any Intelligence tab (Analytics / Rewards / Product / Relationship) → txn panel **stays full 400px** (was: collapsed to sliver).
3. Inside Relationship tab, click "Open AI Banking Assistant" → phone slides in from the right **and** txn panel collapses to a 40px sliver (with click-to-expand chevron, same as today).
4. User can still re-expand the txn sliver via chevron, and collapse the phone via its own chevron — both behaviors preserved.

### Files touched

- `src/pages/ExecDemoPage.tsx` — Col 1 width bindings + lift `phoneVisible` outside the Col 3 IIFE.

No changes to `ExecDemoLeftPanel`, `ExecDemoPhoneView`, or any edge function.

