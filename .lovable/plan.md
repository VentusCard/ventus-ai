## Goal
Make the 3 next- tab buttons (and their text/icons) bigger.

## Change
File: `src/components/exec-demo/ExecDemoIntelPanel.tsx` (lines 371-377)
- `py-2` → `py-3` (taller buttons)
- `gap-1.5` → `gap-2`
- `rounded-md` → `rounded-lg`
- `text-[11.5px]` → `text-[14px]`
- Icon `w-3.5 h-3.5` → `w-4 h-4`