# Align table of contents cards with the slides

## Goal
Make every card in the deck's table of contents match the label shown on the slide it jumps to, and fix the overlay's title.

## Changes (data only, in `src/lib/deckmoScript.ts`)

Rename the `nav` field of each beat so the card matches the slide:

| # | Card now | Card after |
|---|---|---|
| 1 | Thesis | Thesis (unchanged) |
| 2 | The Gap | The Visibility Gap |
| 3 | The Insight | The Complete Picture |
| 4 | Example: Meet Ricky | Meet Ricky |
| 5 | Immediate Value: Decrease Customer Service Cost | Immediate: Lower Service Cost |
| 6 | Value: This Year | Mid-Term: Profit |
| 7 | Value: The Relationship | Mid-Term: Growth |
| 8 | Long-Term: Retention & NPS | Long-Term: Retention & NPS (unchanged) |
| 9 | The Platform | Tools for the Bank |
| 10 | The Ask | The Ask (unchanged) |

Also in `src/lib/deckmoScript.ts`:
- `chrome.presenterTitle`: "Presenter navigator" → "Table of Contents" (matches the button that opens it)

## Not changing
- Step counts ("6 steps" etc.) — already correct, generated from the same data.
- Card layout, numbering, highlight of the current section, jump behavior.
- Any slide content — only the navigator labels.

## Verification
Open the table of contents in a test browser, confirm each card name matches its slide's label, click a card to confirm it still jumps to the right section, and check the build log.
