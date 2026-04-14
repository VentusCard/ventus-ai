

## Make trigger pills highlight transactions in the left panel

Instead of expanding inline evidence, clicking a trigger pill above a product card should highlight the matching transactions in the left panel — using the same `filteredIndices` mechanism that other rollup pills use.

### Changes

**1. `src/components/exec-demo/NextProductRationale.tsx`**
- Remove the `expandedTrigger` state and all expanded evidence rendering (the `ChevronDown/Up` icons, the evidence `<div>` block)
- Remove `useState` import for `expandedTrigger` (keep other imports); remove `ChevronDown`, `ChevronUp` imports
- Add a new prop: `onTriggerPillClick?: (label: string, txIndices: number[], color: string) => void`
- Add an `activeTriggerLabel?: string | null` prop to show which pill is currently active (border highlight)
- On pill click: match the life event evidence merchants against `transactions` to find matching indices, then call `onTriggerPillClick(card.signal_label, matchedIndices, c.dot)`
- Matching logic: for each evidence item, find the transaction index where `tx.merchant` includes the evidence merchant name (case-insensitive partial match)
- Style the active pill with a thicker border (same pattern as other active pills in the demo)

**2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Add `onTriggerPillClick` and `activeTriggerLabel` to Props interface
- Pass them through to `<NextProductRationale>`

**3. `src/pages/ExecDemoPage.tsx`**
- Add a `handleTriggerPillClick` callback that:
  - Clears any existing `activePillFilter` and `activeRollup`
  - Sets a new state `activeTriggerPill: { label: string; indices: number[]; color: string } | null` (toggle on re-click)
- Extend the `filteredIndices` useMemo to also check `activeTriggerPill` — if set, return its `indices`
- Extend `activePillLabel` derivation to include `activeTriggerPill?.label`
- Extend `activePillColor` derivation to include `activeTriggerPill?.color`
- Pass `onTriggerPillClick={handleTriggerPillClick}` and `activeTriggerLabel={activeTriggerPill?.label}` to `ExecDemoIntelPanel`
- Clear `activeTriggerPill` when `onClearFilter` is called

