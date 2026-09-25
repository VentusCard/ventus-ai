# Revise Beat 8.4 phone transition

## Goal
Make Beat 8.4 feel like a direct continuation of 8.3 instead of a separate four-phone wall.

## Changes
- Keep the original live AI phone from 8.3 intact, including its existing Hawaii conversation and any typed follow-up messages.
- On entry to 8.4, animate that phone smoothly from its 8.3 centered position into the leftmost position.
- Remove the separate proactive-nudges mock phone so the retained AI phone becomes the first of four phones.
- Keep the other three focused experiences:
  - Financial planning
  - Subscription management
  - Complete financial picture
- Bring those three phones in sequentially from off-screen right, settling from left to right beside the original phone.
- Remove the current alternating left/right fan-in, rotation, and internal card-by-card entrance effects so the transition reads as one clear horizontal reveal.
- Preserve the completed four-phone layout, headings, labels, strict light styling, arrow navigation, and reduced-motion support.

## Animation sequence
1. The original 8.3 AI phone remains visually continuous and shifts left.
2. Financial planning rolls in from the right.
3. Subscription management follows from the right.
4. Complete financial picture follows last from the right.
5. With reduced motion enabled, all four phones appear immediately in their settled positions.

## Validation
- Confirm 8.3 remains unchanged and the AI conversation still persists.
- Confirm 8.4 starts with the same live AI phone and no duplicate proactive-nudges phone.
- Confirm the three additional phones roll in from the right in order.
- Check replay when leaving and returning to 8.4.
- Check fit and readability at 1540×855 and 1920×1080.
- Confirm clean build and continuous 8.3 → 8.4 → 9.1 arrow navigation.
