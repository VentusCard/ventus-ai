

## Fix: Pills Not Clickable After AI Classification Upgrade

### Root Cause

When the AI classification callback fires (`onClassifiedCallbackRef`), it replaces `profile.persona.signalMap` with new AI-derived labels. However, `processedSignals` — which drives the rendered chips — still contains the **old MCC-based** signal entries from animation time. 

When you click a chip (e.g., MCC label "Pharmacy Shopper"), `filteredIndices` searches the **new** signalMap for that label, but the signalMap now uses AI labels (e.g., "Prenatal Health & Wellness"). No indices match → no transactions highlight → appears "not clickable."

### Fix — `src/pages/ExecDemoPage.tsx`

1. **Re-sync `processedSignals` when signalMap updates**: Add a `useEffect` that watches `profile?.persona.signalMap`. When it changes (i.e., after AI upgrade), rebuild `processedSignals` from the new signalMap — preserving only the indices that were already processed during animation.

```typescript
// When signalMap upgrades (AI classification), re-sync processedSignals
useEffect(() => {
  if (!profile?.persona.signalMap) return;
  setProcessedSignals((prev) => {
    if (prev.length === 0) return prev;
    // Re-derive from updated signalMap, keeping same transaction indices
    const sm = profile.persona.signalMap;
    const updated: SignalEntry[] = [];
    // processedSignals were added in order of tx index — rebuild from signalMap
    const seenIndices = new Set<number>();
    for (const oldSignal of prev) {
      // Find which index this was — look for matching index in signalMap
      for (const [idxStr, entry] of Object.entries(sm)) {
        const idx = Number(idxStr);
        if (!seenIndices.has(idx)) {
          seenIndices.add(idx);
          updated.push(entry);
          break;
        }
      }
    }
    return updated.length > 0 ? updated : prev;
  });
}, [profile?.persona.signalMap]);
```

Actually, a cleaner approach: track which **indices** have been processed, then derive signals from the current signalMap.

2. **Better approach — track processed indices separately**:
   - Add `processedIndices` state (`number[]`) — populated during animation (push `i` for each transaction that has a signal)
   - Derive `processedSignals` via `useMemo` from `processedIndices` + `profile.persona.signalMap`
   - When signalMap upgrades, `processedSignals` automatically re-derives with new labels

### Changes

**`src/pages/ExecDemoPage.tsx`**:
- Add `const [processedIndices, setProcessedIndices] = useState<number[]>([])` 
- In `runAnimationWithProfile`, instead of `setProcessedSignals(prev => [...prev, signal])`, do `setProcessedIndices(prev => [...prev, i])`
- Add `const processedSignals = useMemo(() => processedIndices.map(i => execProfile.persona.signalMap[i]).filter(Boolean), [processedIndices, execProfile.persona.signalMap])`
- Remove `setProcessedSignals` state; reset `processedIndices` where `processedSignals` was reset
- Clear `activePillFilter` when signalMap changes (so stale filter doesn't persist)

### Result
- Pills always reflect the current signalMap labels
- When AI classification arrives and upgrades signalMap, chips seamlessly update labels
- Clicking any pill correctly filters transactions because chip labels and signalMap labels are always in sync

### Files
- `src/pages/ExecDemoPage.tsx`

