## Goal

Keep Regular Client and Wealth Client **stacked vertically**, but make them split the available height **50/50** below the context band — no shared outer scroll. Each card fills its half exactly, and content that overflows scrolls inside its own half.

```text
┌─ Context (3 pill rows) ──────────┐  fixed
├──────────────────────────────────┤
│ Regular Client                   │  exactly 50% of remaining height
│  …flow + chatbot…                │  (scrolls inside if needed)
│  [Open AI Banking Assistant]     │  pinned to bottom of this half
├──────────────────────────────────┤
│ Wealth Client (+)                │  exactly 50% of remaining height
│  …signals + prepped + WM mock…   │  (scrolls inside if needed)
│  [Open WM CoPilot]               │  pinned to bottom of this half
└──────────────────────────────────┘
```

## File

`src/components/exec-demo/NextConversationRationale.tsx` — only the JSX around lines 859–1081. No data, copy, or component changes.

## Changes

### 1. Replace the shared-scroll container with a 50/50 flex split

Current outer wrapper (line 864):

```tsx
<div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto exec-light-scroll pr-1">
```

Becomes a non-scrolling column that hands its height to two equal halves:

```tsx
<div className="flex flex-col gap-3 flex-1 min-h-0">
  <section className="flex-1 basis-0 min-h-0 flex flex-col">{/* Regular */}</section>
  <section className="flex-1 basis-0 min-h-0 flex flex-col pt-3 border-t border-slate-200">{/* Wealth */}</section>
</div>
```

`flex-1 basis-0` on both sections forces each to take exactly half of the parent's height regardless of intrinsic content size.

### 2. Regular Client half (top)

- Keep header + content block.
- Wrap the existing scrollable content (the `space-y-2.5` containing the Email flow + Chatbot context, lines 874–941) in a min-height-0 scroll region:

```tsx
<div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll pr-1 space-y-2.5">
  …automated flow + chatbot context…
</div>
```

- The `Open AI Banking Assistant` button stays **outside** that scroll region, so it remains pinned at the bottom of the half (`mt-3` retained).

### 3. Wealth Client half (bottom)

- Remove the old `pt-4 border-t border-slate-200` from the inner div (line 956) — the new outer `<section>` already provides the divider and spacing.
- Same pattern: header at top, content scrolls in the middle, button pinned at the bottom.
- Wrap the existing `(() => { const wp = … })()` IIFE return in:

```tsx
<div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll pr-1">
  {/* signals + prepped grid + WM Copilot mock */}
</div>
```

- `Open WM CoPilot` button stays outside the scroll region (still `mt-3`).

### 4. Keep these untouched

- `ContextPillRows` and the 3-row context band.
- Inner layout of each card (Email flow card, chatbot Knows/Can-answer, Wealth signals, Talking Points / Next Steps grid, WM Copilot mock chat).
- All playbook data, signals data, and CTA button styling.

## Out of scope

- No changes to Next-Offer or Next-Product tabs.
- No copy or data changes.
- No font-size or padding tweaks — the existing density already fits within each half on the executive-demo viewport.

Approve and I'll switch to build mode and apply it.