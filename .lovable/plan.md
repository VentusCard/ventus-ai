

## Move Consumer Tabs to Bottom of Screen

### Problem
The 4 tabs (UX, Rewards, Relationship, AI) are currently inside the iPad frame at the bottom of the device mockup. The user wants them at the bottom of the **screen** — outside and below the iPad frame.

### Fix — `src/components/demo/DemoDetailOverlay.tsx`

In `renderConsumerOverlay` (lines 125-181):

1. **Remove the tab bar and home indicator from inside the iPad frame** (lines 151-177)
2. **Move the tab bar outside the iPad frame**, pinned to the bottom of the overlay using absolute/fixed positioning or flex layout
3. The iPad frame keeps: camera dot, status bar, content area, home indicator
4. The tab bar renders below the iPad as a bottom-fixed bar spanning the screen width, styled like iOS bottom navigation

**New layout structure:**
```text
Overlay (full screen flex-col)
├── iPad Frame (centered, flex-1)
│   ├── Camera dot
│   ├── Status bar
│   ├── Content (scrollable)
│   └── Home indicator
└── Bottom Tab Bar (fixed to bottom of overlay, full width)
```

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — restructure `renderConsumerOverlay` to place tab bar outside the iPad frame at the bottom of the screen

