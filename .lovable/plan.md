

## Fix Consumer iPad Overlay — Robust Height Solution

### Why previous fixes failed
The incremental flex-chain approach is fragile — missing `min-h-0` at any single level breaks the entire chain. Instead of continuing to patch individual flex levels, I'll use an explicit viewport-based height on the iPad frame, which is simpler and guaranteed to work.

### Changes

**File 1: `src/components/demo/DemoDetailOverlay.tsx`**

1. **Line 224** — Add `min-h-0` to the content wrapper (the one missing link):
```tsx
<div className={`flex-1 min-h-0 ${isBankWide || isConsumer ? 'overflow-hidden' : 'overflow-y-auto px-6 pb-6 pt-2'}`}>
```

2. **Line 127** — Replace `flex-1 min-h-0` on the iPad frame with explicit viewport height so it doesn't depend on the flex chain:
```tsx
<div className="w-full max-w-[820px] rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 2rem)' }}>
```
This guarantees the frame fills the viewport minus padding, regardless of parent flex behavior.

3. **Line 125** — Simplify the consumer wrapper since the frame now has explicit height. Just center it:
```tsx
<div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden">
```
Using `items-center justify-center` (not `flex-col`) so the frame centers both horizontally and vertically within the overlay.

**File 2: `src/components/demo/ConsumerAIChatView.tsx`**

4. **Line 275** — Add `shrink-0` to quick actions so they don't collapse:
```tsx
<div className="px-3 pb-1 flex gap-1 overflow-x-auto no-scrollbar shrink-0">
```

5. **Line 289** — Add `shrink-0` to input area so it stays pinned at bottom:
```tsx
<div className="shrink-0 p-3 border-t border-slate-100 bg-white">
```

### What this achieves
- iPad frame has a guaranteed explicit height — no more fragile flex chain
- Frame is centered in the overlay
- Rewards content scrolls within the frame (overflow-y-auto on content area)
- AI chat input and quick actions stay pinned at the bottom
- All tabs consistent

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — 3 lines
2. `src/components/demo/ConsumerAIChatView.tsx` — 2 lines

