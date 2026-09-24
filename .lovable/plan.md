# New Section 8: Retention and NPS

## Goal
Add a new customer-facing page 8 that shows how a continuously informed AI banking assistant can strengthen long-term retention and NPS.

## Presentation
- Insert the new page after the current relationship-growth page and before **For Your Teams**.
- Renumber the current bank-tools page to 9 and **The Ask** to 10; update the table of contents, counters, and progress automatically through the existing deck structure.
- Keep the established three-column composition: executive narrative, the same enlarged Ricky phone mockup, and staged callouts.
- Use a long-term retention/NPS headline and concise opportunity-focused copy, matching the deck’s light enterprise style.

## Phone Experience
- Open the phone on its existing **AI** tab with Ricky’s identity, full battery treatment, navigation, and the same dimensions as the other customer-value pages.
- Automatically begin with the customer question: **“How much have I spent on Hawaiian vacations?”**
- Send that question to the existing live customer assistant, grounded in Ricky’s complete enriched transaction history and customer context.
- Keep the composer active so the presenter can ask live follow-up questions during the presentation.
- Preserve the current session-only conversation behavior; no saved history or new conversation management will be introduced.

## Beat Sequence
1. Reveal the live customer question and response, demonstrating that the bank understands the customer’s history.
2. Reveal how context-aware answers reduce friction and make the relationship feel continuous.
3. Connect the experience to stronger engagement, retention, and NPS without displaying invented performance metrics.

## Technical Details
- Add a dedicated deck scene and content entry rather than modifying the existing relationship or bank-tools pages.
- Reuse `ExecDemoPhoneView` with `presentationTab="ai"`, passing the deck fixture’s transactions, life events, offers, and products plus a one-time prompt trigger.
- Prevent remounts or beat navigation from submitting duplicate live requests; maintain the conversation while moving among the page’s beats.
- Keep keyboard navigation inactive while typing in the AI input.
- Reuse the current live customer-assistant function; only adjust its connection if live verification shows an actual request failure.

## Verification
- Test the initial Hawaiian-vacation question, live response, and a manual follow-up.
- Verify forward/back navigation does not duplicate messages or reset the conversation unexpectedly.
- Check page numbering and table-of-contents ordering after insertion.
- Verify fit and readability at 1024×768, 1590×855, and 1920×1080, then confirm clean project diagnostics.
