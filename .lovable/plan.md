

## Goal
Make the 3 action buttons (Next-Offer, Next-Product, Next Conversation) below the intel panel stretch full width and look more visually prominent.

## Change
Single edit in `src/components/exec-demo/ExecDemoIntelPanel.tsx`, lines 587-602 (the post-synthesis action buttons block).

### Layout
- Change container from `flex items-center justify-center gap-3` to a 3-column grid (`grid grid-cols-3 gap-3 w-full`) so each button takes equal full width.
- Add horizontal padding to the container to match the rest of the panel (`px-1`).

### Button styling — more prominent
- Stretch each button full width of its grid cell (`w-full`).
- Increase vertical padding (`py-3.5` instead of `py-2.5`) for taller, weightier buttons.
- Stack icon above label, centered (`flex-col`), so labels read clearly at full width.
- Bigger icon (`w-5 h-5`) and slightly larger label (`text-sm` instead of `text-xs`).
- Stronger default border + subtle gradient background (`bg-gradient-to-b from-white to-slate-50`).
- Stronger hover: lift effect (`hover:-translate-y-0.5`), border becomes primary, soft primary shadow.
- Keep existing staggered entrance animation.

## Out of scope
- The secondary tab bar (lines 615-635) used after a tab is selected — not touched.
- No copy changes; labels remain "Next-Offer", "Next-Product", "Next Conversation".

## Expected result
Three full-width, taller, icon-on-top buttons spanning the panel, with a clear hover lift and primary accent — visually reading as the primary call-to-action row after synthesis.

