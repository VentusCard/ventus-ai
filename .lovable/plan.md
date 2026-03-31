

## Fix AI Tab to Fill Full iPad Frame Height

### Problem
The content area inside the iPad frame (`flex-1 overflow-y-auto`) doesn't give the `ConsumerAIChatView` a concrete height to fill. The chat component's `h-full` has nothing to resolve against, so it collapses to content height instead of stretching like the other tabs.

### Fix — Two files, minimal changes

**1. `src/components/demo/DemoDetailOverlay.tsx` (line 144)**
Add `min-h-0` to the content wrapper so `flex-1` shrinks properly in the flex column:
```tsx
<div className="flex-1 overflow-y-auto bg-white min-h-0">
```

**2. `src/components/demo/ConsumerAIChatView.tsx` (root div)**
The root container needs `min-h-0` alongside `h-full` so flex layout cooperates, and the scrollable chat area also needs `min-h-0`:
- Root: `flex flex-col h-full min-h-0 bg-white`
- Chat scroll div: add `min-h-0` alongside `flex-1 overflow-y-auto`

These are standard flex-column fixes — without `min-h-0`, nested flex children with `overflow` can't calculate their available space correctly, causing the content to not stretch.

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — line 144, add `min-h-0`
2. `src/components/demo/ConsumerAIChatView.tsx` — add `min-h-0` to root and scroll area

