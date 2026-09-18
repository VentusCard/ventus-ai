# Add a segment marketing-copy beat to `/deckmo`

## Goal
Add one new presentation page as the third mid-term outcome, showing how one customer segment becomes tailored marketing copy. Use the existing Campaign Builder’s Cashback (3/2/1) example and the selected **Everyday Foodie** campaign.

## New mid-term beat
- Insert the new beat directly after the current mid-term customer experience and before the long-term relationship section.
- Frame it as the third mid-term outcome: turning customer intelligence into segment-level campaign activation.
- Add the beat to slide numbering, progress, keyboard/click navigation, and presenter navigation automatically through the deck’s central beat list.

## Slide experience
- Use a full-width, executive presentation layout rather than a phone mockup.
- Show the Campaign Builder’s Step 3 visual language: the **Micro-Segment Personalized Campaign Output** card, segment family, estimated reach treatment, subject line, body copy, CTA, and rationale.
- Feature the existing Everyday Foodie example from Cashback (3/2/1):
  - Segment: “Everyday foodie (budget tier)”
  - Subject: “6% on takeout, 4% on groceries — eat happy”
  - CTA: “Start earning on takeout”
- Add concise presentation framing around the card to explain the progression from behavioral signal to tailored copy and activation-ready output.
- Keep the customer-facing copy free of Risk content and preserve the strict light, bank-presentation style.

## Technical approach
- Reuse the existing deterministic campaign-card data and visual patterns instead of duplicating or rewriting the marketing copy.
- Create a deck-specific presentation wrapper so the example is frozen, immediately visible, and makes no service requests or timed transitions.
- Extend the centralized deck script and scene mapping with the new beat while leaving `/bankdemo` unchanged.

## Verification
- Confirm the new page appears in the intended mid-term position and all later slide numbers update correctly.
- Check the slide at 1024×768, 1440×900, and 1920×1080 for clipping or overlap with the header and footer.
- Verify arrow keys, clicks, scrolling, and presenter navigation enter and leave the new beat correctly.
- Confirm the deck remains network-free and diagnostics report no build or runtime errors.

## Scope
No changes to Campaign Builder behavior, campaign-generation rules, or other `/bankdemo` pages.
