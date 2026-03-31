

## Problem
The 4 module cards on the right side of the demo dialog lack clear visual differentiation between selected and unselected states. The current checkbox is small and uses Tailwind dynamic classes that don't work (e.g. `data-[state=checked]:${checkColor.replace(...)}`).

## Solution
Replace the small `Checkbox` with a larger, more visible circle indicator that shows:
- **Selected**: Filled circle in the module's color with a white checkmark inside (like `CheckCircle2` icon)
- **Unselected**: Empty circle outline in gray

Also increase contrast between selected/unselected card states:
- **Selected**: Full color left border, white background, bold text, colored check circle
- **Unselected**: Gray left border, washed-out background, muted text, empty gray circle

## Changes

**File: `src/components/demo/DemoCustomerPanel.tsx`**

1. Remove `Checkbox` import, add `CheckCircle2, Circle` to lucide imports (CheckCircle2 already imported)
2. Replace the `<Checkbox>` element with a conditional icon:
   - When checked: `<CheckCircle2>` in the module's color (e.g. `text-blue-600`, `text-emerald-500`)
   - When unchecked: `<Circle>` in `text-slate-300`
   - Size: `h-5 w-5` for better visibility
3. Sharpen the card's selected vs unselected styling:
   - Unselected: `opacity-50 bg-slate-50` + gray border-left instead of colored
   - Selected: `opacity-100 bg-white shadow-sm` + colored border-left

