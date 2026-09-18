# Dynamic `/deckmo` briefing header

## Goal
Replace the fixed “Customer Intelligence Briefing” label with the current chapter name as the presentation advances.

## Changes
- Bind the header’s primary label to the active beat’s existing navigation title.
- Update it automatically for footer controls, keyboard navigation, presenter navigation, and direct scrolling.
- Preserve the current header dimensions, typography, branding, and right-side presentation metadata.
- Prevent longer chapter names from colliding with the logo or metadata by constraining the label cleanly.

## Verification
- Navigate through every chapter using buttons, arrow keys, presenter view, and scrolling.
- Confirm the header always matches the active chapter and remains contained at supported desktop sizes.
- Confirm the presentation has no runtime or build errors.
