

## Visual Tweaks to Beat 3 Icon Grid

**File**: `src/components/demo/DemoPasswordGate.tsx`

### Changes

1. **Ellipsis color**: Change both `…` spans from `text-amber-400` to `text-slate-400` (grey dots).

2. **Icon spacing**: Increase the grid gap from `gap-4` to `gap-6` and widen the container from `max-w-2xl` to `max-w-3xl` so icons spread out more. Also widen the outer flex wrapper from `max-w-3xl` to `max-w-4xl`.

### Lines affected
- Line 363: outer flex wrapper — change `max-w-3xl` → `max-w-4xl`
- Line 364: left ellipsis — change `text-amber-400` → `text-slate-400`
- Line 365: grid — change `gap-4` → `gap-6`, `max-w-2xl` → `max-w-3xl`
- Line 391: right ellipsis — change `text-amber-400` → `text-slate-400`

