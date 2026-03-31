

## Fix Consumer AI Chat Tab Not Full Height

### Root cause
In `DemoDetailOverlay.tsx` line 144, the iPad content area is `overflow-y-auto` — this works for scrollable tabs (UX, Rewards, Relationship) but breaks the AI chat tab which needs a constrained height to stretch via `h-full` + `flex flex-col`.

### Fix — `src/components/demo/DemoDetailOverlay.tsx`

**Line 144**: Make the overflow conditional based on the active tab:

```tsx
<div className={`flex-1 bg-white min-h-0 ${activeTab === 'ai' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
```

When the AI tab is active, use `overflow-hidden` so the chat view fills the container. Other tabs keep `overflow-y-auto` for normal scrolling.

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — 1 line

