

## Fix "Next Step" Popup Spacing & Typography

Looking at the screenshot, the issues are: cramped header, thin separator, small tagline text, Mission section labels too small, body text too small, cards on right need more breathing room, and the overall dialog feels tight.

### Changes — `src/components/ContactFormDialog.tsx`

**Header (lines 33-37)**
- Increase padding: `px-10 pt-8 pb-6` → `px-12 pt-10 pb-8`
- Logo: `w-36` → `w-44` (bigger)
- Separator: `h-6 w-px` → `h-8 w-px bg-slate-300` (taller, darker)
- Tagline: `text-lg font-semibold text-slate-700` → `text-xl font-bold text-slate-800`

**Left panel — Mission (lines 41-60)**
- More padding: `p-10 md:p-12` → `p-10 md:p-14`
- "MISSION" label: `text-xs` → `text-[13px]`, add `text-slate-500` and `mb-10`
- Section labels ("RIGHT NOW", etc.): `text-[11px]` → `text-[12px]`, `mb-1.5` → `mb-2`
- Body text: `text-[15px]` → `text-base` (16px)
- Increase vertical gaps: `space-y-8` → `space-y-10`

**Right panel — Deck buttons (lines 63-82)**
- More padding: `p-10 md:p-12` → `p-10 md:p-14`
- "Learn More" heading: `text-xl mb-6` → `text-2xl mb-8`
- Cards: `px-5 py-4` → `px-6 py-5`, gap `space-y-4` → `space-y-5`
- Icon container: `w-10 h-10` → `w-11 h-11`
- Card label text: `text-[15px]` → `text-base`

**Dialog min-height**
- `min-h-[360px]` → `min-h-[400px]`

