# 8.4 Conversations: Revert Customer-Initiated, Placeholder the AI-Initiated Replies

## Current state
- In `src/lib/deckmoScript.ts` (`DECKMO.retention.showcase.phones`), the three **customer-initiated** conversations (Financial planning, Subscription management, Complete financial picture) had their assistant replies replaced with placeholders ("Sure! Here is what I found...", "Sure! Here is what I found...", "Yes, here are the options...").
- The three **AI-initiated** conversations (Credit score update, Payment support, Cash-flow support) end with the customer's reply ("Show me what changed.", "Help me prevent that next month.", "Yes, show me the options.") and the AI never responds.

## Changes

### 1. Revert the customer-initiated replies (src/lib/deckmoScript.ts)
Restore the original assistant answers verbatim:
- Financial planning: "**You're 68% toward your home purchase fund.** At your current pace, you're on track for Summer 2027. I'd keep travel savings separate so the home goal stays protected."
- Subscription management: "I found three recurring services. **Spotify Premium increased to $13.99 monthly.** Adobe Creative Cloud is $59.99 monthly, and your pet wellness plan is $42.00 monthly."
- Complete financial picture: "Your clearest next priority is the **home purchase goal**. I'm balancing that with your growing business, frequent travel, tennis, and pet-care commitments so recommendations fit your whole life."

### 2. Add AI placeholder replies to the AI-initiated conversations
Add a new optional `reply` field on the three AI-initiated phones, rendered as a final assistant message:
- Credit score update → "Sure! Here is what I found..."
- Payment support → "Yes, I can set that up for you..."
- Cash-flow support → "Yes, here are the options..."

### 3. Render the extra reply (src/components/deckmo/DeckmoBankdemoScenes.tsx)
In `ShowcasePhone`, when a phone has a `reply` field (AI-initiated), append it as a third assistant message to `chatInitialMessages`, so the sequence is: AI message → customer reply → AI placeholder response. Customer-initiated phones are unchanged in rendering.

## Verification
- Build passes (build-errors.log clean).
- Playwright: navigate to 8.4, confirm each AI-initiated phone shows the closing AI placeholder bubble and the customer-initiated phones show the original detailed responses; carousel still rolls.
