# Fix Announcement Bar

## Goal
Polish the conference announcement bar so the text is centered, the white text stays readable against the existing blue background, and the mobile dismiss button is proportionally sized.

## Changes

### 1. Center the text on all viewports
- Remove `sm:text-left` from the announcement paragraph.
- Keep the paragraph centered within the bar using `text-center` and a layout that does not push the text to one side.
- Ensure the "schedule a meeting" link remains inline and does not break the centered line rhythm.

### 2. Keep the existing background and white text
- Leave `bg-blue-600` unchanged.
- Confirm text remains `text-white` and the link hover state stays subtle.

### 3. Reduce dismiss button size on mobile
- Make the button `h-5 w-5` on small screens and `h-6 w-6` on `sm` and up.
- Keep the icon comfortably visible (e.g., `X size={12}` mobile, `size={14}` desktop) and maintain accessible touch target via padding or the surrounding button area.

## Files to edit
- `src/components/AnnouncementBar.tsx`

## Verification
- Build/typecheck passes.
- Visual check on desktop and mobile preview: text centered, white text on existing blue background, mobile close button not oversized.
