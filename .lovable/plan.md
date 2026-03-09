

## Analysis

The theme is dark: popover background is `0 0% 5%` (near-black), foreground is `0 0% 95%` (near-white). The fix used `text-slate-900` which is a very dark color — essentially invisible on the dark popover background.

## Fix: `src/components/tepilot/campaigns/TierProductSelector.tsx`

Line 95: Change selected state styling from `text-slate-900` to a light color that's visible on dark backgrounds. Use `text-white` or `text-foreground` (which maps to near-white in this theme).

The issue is that `text-foreground` was the original value and reportedly didn't work either. Let me check — `--foreground: 0 0% 95%` should render as near-white. If that wasn't working, perhaps the `bg-primary/10` background combined with `text-foreground` was fine all along and the real problem is elsewhere (e.g., a parent overriding color, or the wrong element being styled).

Given the dark theme, the correct fix is:
- Selected items: `bg-primary/10 text-white font-medium` (explicit white text on dark popover)

| File | Change |
|------|--------|
| `TierProductSelector.tsx` | Line 95: change `text-slate-900` to `text-white` |

