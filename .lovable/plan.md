

## Fix iPad Frame & Bottom Nav — Full Height Layout

### Root cause
Two issues remain:

1. **Parent wrapper (line 125)** has `justify-center` — this vertically centers the frame instead of letting it stretch. Combined with `h-full` on the frame, the frame collapses to content height because `justify-center` overrides the stretch behavior.

2. **Frame (line 127)** uses `h-full` which doesn't work reliably when the parent uses `justify-center`. Needs `flex-1 min-h-0` instead so it fills the remaining space in the flex column.

### Fix — `src/components/demo/DemoDetailOverlay.tsx`

**Line 125** — Remove `justify-center` so frame stretches; use `min-h-0` for flex shrinking:
```tsx
<div className="flex-1 min-h-0 flex flex-col items-center p-4 overflow-hidden">
```

**Line 127** — Replace `h-full` with `flex-1 min-h-0` so the frame fills the parent:
```tsx
<div className="w-full max-w-[820px] flex-1 min-h-0 rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col">
```

**Line 149** — Add `shrink-0` to the bottom tab bar so it never collapses:
```tsx
<div className="flex shrink-0 border-t border-slate-200 bg-slate-50/80 px-2">
```

**Line 172** — Add `shrink-0` to the home indicator:
```tsx
<div className="flex shrink-0 justify-center py-2 bg-white">
```

### What this achieves
- Frame fills the full overlay height (minus padding)
- Camera dot, status bar, tab bar, and home indicator are pinned and never shrink
- Content area (`flex-1 min-h-0`) takes all remaining space
- Bottom 4-tab nav always visible at the bottom

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — 4 lines

