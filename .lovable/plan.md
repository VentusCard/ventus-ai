# Update /demo password gate copy and bullet sizing

## Changes

### 1. `src/pages/ExecDemoPage.tsx` (line 907)
Update the tagline prop value:
- From: `"AI Customer Intelligence for Banks"`
- To: `"AI Native Customer Intelligence Infrastructure for Banks"`

### 2. `src/components/demo/SimplePasswordGate.tsx` (lines 43-54)
Shrink the three bullets so the tagline becomes the dominant headline:
- Bullet dot size: `w-2 h-2` → `w-1.5 h-1.5`
- Gap between dot and label: `gap-3` → `gap-2`
- Label text: `text-[18px] md:text-[20px] font-semibold text-slate-700` → `text-[13px] md:text-[14px] font-medium text-slate-600`

Tagline styling and all other elements remain unchanged.
