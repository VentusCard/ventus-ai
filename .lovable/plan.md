## Goal
Make the /demo top bar slightly bigger.

## Change
File: `src/pages/ExecDemoPage.tsx` (lines 1109-1131)
- Bar height `h-14` → `h-16`
- Logo `h-7` → `h-8`
- Tagline text `text-[14px]` → `text-[15px]`
- "Next Step →" button `text-[12px]` → `text-[13px]`
- Close icon button `w-8 h-8` → `w-9 h-9`, icon `w-4 h-4` → `w-[18px] h-[18px]`

Subtle scale-up across the whole header.