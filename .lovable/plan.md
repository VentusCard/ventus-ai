

## Plan: Remove Auto-Advance on Beat 6

### What changes
Remove the `useEffect` at lines 102-107 that automatically transitions `beat6Phase` from 0 to 1 after 1.8 seconds. The user will need to click or press a key to advance instead.

### File: `src/components/demo/DemoPasswordGate.tsx`

1. **Delete lines 102-107** — the `useEffect` that runs `setTimeout(() => setBeat6Phase(1), 1800)` when `step === 6 && beat6Phase === 0`.

That's it. The advance/click handler already supports progressing `beat6Phase` manually (lines 53-56), so no other changes are needed.

