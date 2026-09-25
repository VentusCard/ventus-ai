# Simplify customer-initiated replies in beat 8.4

## Goal
Make the customer-initiated 8.4 examples communicate breadth without showing detailed generated results.

## Change
- Update only the seeded assistant replies for the three customer-initiated conversations in `src/lib/deckmoScript.ts`:
  - Financial planning: replace the detailed home-fund response with a short placeholder such as “Sure! Here is what I found...”
  - Subscription management: replace the subscription breakdown with a short placeholder such as “Sure! Here is what I found...”
  - Complete financial picture: replace the detailed recommendation with a short placeholder such as “Yes, here are the options...”
- Leave the customer questions, phone labels, supporting cards, AI-initiated conversations, Hawaii conversation, live chat behavior, carousel animation, and layout unchanged.

## Verification
- Confirm all three customer-initiated phones show a customer question followed by a concise placeholder response.
- Confirm the AI-initiated credit-score, payment-support, and cash-flow examples retain their current conversation order and copy.
- Confirm beat 8.4 still rolls continuously and the preview remains clean.
