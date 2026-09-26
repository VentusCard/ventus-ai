# Rotate Section 7 Product Cards Automatically

## Goal
Make the three “Recommended for You” cards in section 7 rotate automatically, matching the established autonomous behavior of section 6’s deal collections.

## Changes
- Add a dedicated presentation option for automatic product-card rotation and enable it only for section 7 in `/deckmo` and `/bankdemo`.
- Pass that option through the phone and relationship views to the existing product-card carousel.
- Rotate through the current cards in their existing order every 4 seconds:
  1. Our Bank Preferred Mortgage
  2. Our Bank Premium Rewards Card
  3. Our Bank Guided Investing
- Keep the current slide animation, card content, section 7 beats, phone layout, arrows, and navigation unchanged.
- Preserve manual previous/next controls and pause rotation while the user hovers over or interacts with the card area; resume afterward.
- Leave product cards elsewhere unchanged.

## Technical details
- Separate “presentation mode” from “allow automatic product rotation” so the deck remains locked to its intended tab while its cards can still advance.
- Scope the new flag through `ExactPhone` → `ExecDemoPhoneView` → `RelationshipPhoneView` → `ProductCardsPhoneView`.
- Reuse section 6’s 4-second cadence rather than changing the carousel globally.

## Validation
- Verify beats 7.1–7.3 at 1691×1011 and 1540×855.
- Confirm all three cards cycle continuously in order without advancing the deck.
- Confirm hover pauses rotation, leaving resumes it, manual arrows still work, and section 6 remains unchanged.
- Confirm the preview build is clean.
