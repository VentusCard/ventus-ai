## Goal
Make the content inside the segmented email draft card on `/solutions/campaign-intelligence` noticeably larger and easier to read without breaking the surrounding layout.

## Current state
`CampaignStudioPreview.tsx` already uses the "Prominent campaign card" layout, but the copy inside the draft card is still small:
- Subject line: `text-[15px]`
- Body copy: `text-[14px]`
- Category/value chips: `text-[12px]`
- Channel chips: `text-[11px]`
- Header title: `text-lg`
- Icon container: `w-12 h-12` with `w-6 h-6` Mail icon
- Card padding: `p-7`

## Proposed changes
1. **Typography scale-up**
   - Subject line: `text-[15px]` → `text-[18px]` (semibold)
   - Body copy: `text-[14px]` → `text-[16px]` leading-relaxed
   - Header title: `text-lg` → `text-xl`
   - Category/value chips: `text-[12px]` → `text-[13px]`
   - Channel chips: `text-[11px]` → `text-[12px]`
   - "Draft" / "To" meta: keep at current size or bump to `text-[12px]`

2. **Icon & header presence**
   - Icon container: `w-12 h-12` → `w-14 h-14`
   - Mail icon: `w-6 h-6` → `w-7 h-7`

3. **Card proportions**
   - Padding: `p-7` → `p-8`
   - Increase internal gaps (`mb-5` → `mb-6`, `gap-2` → `gap-3`) so the larger text breathes.

4. **Segment tabs (optional, if needed)**
   - Tab label: `text-[13px]` → `text-[14px]`
   - Tab angle chip: `text-[10px]` → `text-[11px]`

5. **Verify responsiveness**
   - Check that the card still fits within the `max-w-7xl` page container at 1280px+ without overflow.
   - Ensure the bottom progress bar and `-mx-8` negative margin math is updated to match new padding.

## Acceptance criteria
- Draft card subject and body are the most visually prominent elements in the card.
- No text overlaps or truncation at desktop viewport.
- Typecheck and build pass.