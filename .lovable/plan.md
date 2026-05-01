## Goal
Make all content inside the data selection dialog (`ExecDemoSelectionDialog`) larger and easier to read at presentation distance. Keep the same `85vw × 85vh` modal frame.

## Changes — `src/components/exec-demo/ExecDemoSelectionDialog.tsx`

### Header (lines 113–125)
- Logo `h-7` → `h-9`
- Title `text-[15px]` → `text-lg`
- Subtitle `text-[12px]` → `text-sm`
- Padding `px-6 py-3` → `px-8 py-5`

### Customer pills (lines 127–155)
- Pill text `text-[12px]` → `text-sm`
- Pill padding `px-4 py-2` → `px-5 py-2.5`
- Custom pill icon `w-3 h-3` → `w-4 h-4`
- Container padding `px-6 py-4` → `px-8 py-5`

### Custom flow (lines 158–210)
- Section labels `text-[10px]` → `text-xs`
- Textareas `text-[11px]` / `text-[10px]` → `text-sm` / `text-xs font-mono`
- Buttons `text-[11px]` → `text-sm`, `py-2` → `py-2.5`
- Back link `text-[11px]` → `text-xs`
- Min textarea height `min-h-[88px]` → `min-h-[140px]`

### Transaction table (lines 217–266)
- Table padding `px-6` → `px-8`
- Header cells `text-[11px]` → `text-xs`, `px-2 py-2` → `px-3 py-3`
- Body cells `px-2 py-1.5` → `px-3 py-2.5`
- Source badge `text-[10.5px]` → `text-xs`, `px-1.5 py-0.5` → `px-2 py-1`
- ID `text-[11px]` → `text-xs`
- Date `text-[12px]` → `text-sm`
- Merchant `text-[12px]` → `text-sm`, `max-w-[220px]` → `max-w-[260px]`
- MCC pill `text-[11px]` → `text-xs`, `px-1.5 py-0.5` → `px-2 py-1`
- Description `text-[11.5px]` → `text-sm`, `max-w-[220px]` → `max-w-[260px]`
- Amount `text-[12px]` → `text-sm`
- Zip `text-[11px]` → `text-xs`
- Empty state `text-[11px] py-12` → `text-sm py-16`

### Footer (lines 271–279)
- Padding `px-6 py-4` → `px-8 py-5`
- Button `text-[13px] py-3` → `text-base py-3.5`
- Play icon `w-4 h-4` → `w-5 h-5`

## Out of scope
- No layout / column / behavior changes.
- No change to dialog dimensions (stays `85vw × 85vh`).