

## Fix Content Positioning & Header Sizing

### Problem
Content in both panels sits too low because `justify-center` on the outer container fights with `flex-1 justify-center` on the inner content div. The "Mission" and "Learn More" labels are too small at 13px.

### Changes — `src/components/ContactFormDialog.tsx`

**Make "Mission" and "Learn More" bigger and bold (lines 42, 64):**
- Change from `text-[13px] font-bold uppercase tracking-widest text-slate-500` to `text-lg font-bold uppercase tracking-wider text-slate-700`
- Reduce bottom margin from `mb-10` to `mb-6` so content doesn't push down as much

**Fix vertical positioning — left panel (lines 41, 44):**
- Change outer div from `justify-center` to `justify-start pt-10` (keep `items-center text-center`)
- Remove `flex-1` from inner content div so it doesn't stretch and push content down

**Fix vertical positioning — right panel (line 63):**
- Change from `justify-center` to `justify-start pt-10` to match left panel

This aligns both sections to start from a consistent top position rather than being pushed to vertical center of a tall container.

