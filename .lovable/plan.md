

# Fix White-on-White Button Text in TePilot Theme

## Problem
The Button component's `secondary` variant uses `bg-secondary text-white`. In the TePilot light theme, `--secondary` resolves to `210 40% 96%` (near-white), creating invisible white text on a white background.

## Root Cause
In `src/components/ui/button.tsx`, the secondary variant hardcodes `text-white`:
```
secondary: "bg-secondary text-white hover:bg-secondary/85"
```
This works in dark mode (dark bg + white text) but breaks in the tepilot-theme (light bg + white text).

## Fix
**File: `src/components/ui/button.tsx`**

Change the secondary variant from `text-white` to `text-secondary-foreground`:
```
secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/85"
```

This uses the CSS variable which resolves to:
- Dark theme: light text (0 0% 90%) on dark bg -- correct
- TePilot theme: dark text (222 47% 11%) on light bg -- correct

This is a one-line change in the button variants configuration. No other files need modification -- the Badge component already uses `text-secondary-foreground` correctly.

