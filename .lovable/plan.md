

## Fix Consumer AI Chat Tab Height — Root Cause Deep Dive

### Problem chain
There are **two** remaining issues preventing the chat from filling height:

1. **`renderConsumerOverlay` wrapper (line 125)** uses `overflow-y-auto` which creates a scroll container — the iPad frame inside it has no bounded height to inherit from, so `flex-1` on children resolves to content height.

2. **`ConsumerAIChatView` root (line 191)** uses `h-full` which doesn't work reliably inside nested flex containers. It should use `flex-1 min-h-0` instead.

### Fixes

**File 1: `src/components/demo/DemoDetailOverlay.tsx`**
- Line 125: Change `overflow-y-auto` to `overflow-hidden` on the consumer overlay wrapper so the iPad frame gets a proper bounded height:
```tsx
<div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
```

**File 2: `src/components/demo/ConsumerAIChatView.tsx`**  
- Line 191: Replace `h-full` with `flex-1 min-h-0` so it fills remaining flex space reliably:
```tsx
<div className="flex-1 min-h-0 flex flex-col bg-white">
```

### Summary
Two lines changed across two files. The root cause was two layers of the height chain not constraining properly — the outer wrapper scrolling when it shouldn't, and the chat view using `h-full` instead of `flex-1 min-h-0`.

