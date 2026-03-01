

# Tighten Pillar Cards -- Reduce Vertical Whitespace

## What Changes

Reduce padding, gaps, font sizes, and spacing inside each pillar card to make them shorter and more compact.

### Changes in `src/components/tepilot/insights/PillarExplorer.tsx`

1. **CardContent padding**: `p-4` → `p-3`
2. **Inner flex gap**: `gap-3` → `gap-1.5`
3. **Color bar height**: `h-1` → `h-0.5`
4. **Pillar name**: remove `mb-1` margin
5. **Spend amount**: `text-2xl` → `text-lg`
6. **Trip summary**: remove `mt-1`
7. **Sparkline height**: `h-6` → `h-4`

These are all small tweaks within the same file, targeting lines ~84-125. No layout or logic changes -- just tighter spacing.
