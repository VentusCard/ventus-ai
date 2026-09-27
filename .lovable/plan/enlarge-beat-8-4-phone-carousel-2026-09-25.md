# Enlarge Beat 8.4 Phone Carousel

## Goal
Keep three phones visible at once, but use the slide’s available space more effectively so the mockups and their conversations are clearly readable.

## Changes
- Preserve the existing seven-conversation automatic carousel, rotation timing, right-to-left transition, interaction pause, and independent chat history.
- Keep three phones in one centered row and retain the established 11:20 phone proportions.
- Increase each phone’s height and derived width, while reducing excessive outer gutters and spacing between phones so the row occupies more of the presentation canvas.
- Tighten the section heading area above the carousel to release more vertical room without changing its copy.
- Increase the shared AI chat typography, message-bubble spacing, avatars, composer text, and phone navigation labels proportionally for presentation readability.
- Apply the larger internal treatment consistently to the Hawaii phone and all six rotating examples; do not alter `/demo` or other deck phone scenes.
- Keep all conversation content, AI/customer message order, live typing, green battery state, and matching navigation bars unchanged.

## Validation
- Verify Beat 8.4 at 1540×855 and 1920×1080.
- Confirm exactly three larger phones remain visible without clipping or text collisions.
- Confirm every carousel item cycles through, chat interaction pauses rotation, typed conversations remain independent, and arrow-key slide navigation still works.
- Confirm the current build remains clean.

## Technical details
- Scope the larger text treatment through a Beat 8.4 presentation-sizing prop or wrapper so shared phone components elsewhere are unaffected.
- Continue sizing the frames by height with `aspect-ratio: 11 / 20`; rebalance the carousel grid gutters rather than distorting the devices.
