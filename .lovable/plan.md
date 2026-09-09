# Fix Announcement Bar

## Goal
Polish the conference announcement bar so the text is centered, the background is less visually heavy, and the mobile dismiss button is proportionally sized.

## Changes

### 1. Center the text on all viewports
- Remove `sm:text-left` from the announcement paragraph.
- Keep the paragraph centered within the bar using `text-center` and a layout that does not push the text to one side.
- Ensure the "schedule a meeting" link remains inline and does not break the centered line rhythm.

### 2. Lighten the background color
- Change the bar background from `bg-blue-600` to a softer, less dominant blue (e.g., `bg-blue-500` or `bg-sky-500`) so it draws less attention while still readable.
- Keep white text and the subtle hover state on the dismiss button.

### 3. Reduce dismiss button size on mobile
- Make the button `h-5 w-5` on small screens and `h-6 w-6` on `sm` and up.
- Keep the icon comfortably visible (e.g., `X size={12}` mobile, `size={14}` desktop) and maintain accessible touch target via padding or the surrounding button area.

## Files to edit
- `src/components/AnnouncementBar.tsx`

## Verification
- Build/typecheck passes.
- Visual check on desktop and mobile preview: text centered, color lighter, mobile close button not oversized.
