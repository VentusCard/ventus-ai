

## Fix Double iPad Border + Move Tabs to Bottom

### Problem
Two iPad bezels are rendering because:
1. `DemoDetailOverlay.tsx` renders an iPad frame in `renderConsumerOverlay` (lines 130-178)
2. Each child view (`DemoEngagementView`, `DemoRewardsView`, `DemoWealthView`) renders its **own** iPad frame internally

### Fix — 2 parts

**Part 1: Remove the inner iPad frames from each child view**

Strip the iPad frame wrapper (bezel, camera dot, status bar, home indicator) from:
- `DemoEngagementView.tsx` — remove the outer iPad shell, keep only the content inside
- `DemoRewardsView.tsx` — same
- `DemoWealthView.tsx` — same

Each view should return just its content (the stuff inside the frame), not the device chrome. The parent overlay already provides the frame.

**Part 2: Move tab bar to bottom in `DemoDetailOverlay.tsx`**

In `renderConsumerOverlay` (lines 125-181), reorder the layout from:

```text
Camera dot → Status bar → Tab bar → Content → Home indicator
```

To:

```text
Camera dot → Status bar → Content → Tab bar → Home indicator
```

Change the tab bar from `border-b` to `border-t border-slate-200` so it looks like iOS bottom navigation.

### Files changed
1. `src/components/demo/DemoEngagementView.tsx` — unwrap iPad frame
2. `src/components/demo/DemoRewardsView.tsx` — unwrap iPad frame
3. `src/components/demo/DemoWealthView.tsx` — unwrap iPad frame
4. `src/components/demo/DemoDetailOverlay.tsx` — move tab bar below content

### What stays untouched
- All non-consumer overlays
- Network diagram cards
- Tab switching logic and content rendering

