

## Plan: Fix selected item text color in TierProductSelector dropdown

Looking at the screenshot, the selected dropdown item text is appearing white/invisible against the highlight background.

### Change: `src/components/tepilot/campaigns/TierProductSelector.tsx`

On line 95, change the selected state class from `bg-primary/5 text-foreground` to `bg-primary/10 text-slate-900` to ensure the text is always visibly dark regardless of theme variable resolution.

| File | Change |
|------|--------|
| `TierProductSelector.tsx` | Line 95: replace `text-foreground` with explicit dark text color `text-slate-900` for selected items |

