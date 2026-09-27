# Rephrase the deck chapter labels

The header, footer "Current section", and presenter view all read their chapter
name from the beat list in `src/lib/deckmoScript.ts` (`nav` field on each beat).
Rephrase those labels so they read like the narrative of a leadership briefing
rather than generic stage names.

## Changes

Edit only the `nav` strings on the beat list in `src/lib/deckmoScript.ts`:

| Beat | Current | New |
|---|---|---|
| opener | Opening | Thesis |
| visibility | The visibility gap | The Gap |
| living-view | One customer view | The Insight |
| ricky | Meet Ricky | Proof: Meet Ricky |
| immediate | Immediate value | Value: Today |
| mid-term | Mid-term value | Value: This Year |
| segment-campaign | Segment activation | Activation |
| long-term | Long-term value | Value: The Relationship |
| bank-tools | Tools for the bank | For Your Teams |
| close | Close | The Ask |

No layout, styling, or beat/step changes — labels stay short so the header
truncation and footer widths are unaffected. Presenter view numbering and the
dynamic header behavior from the previous change remain untouched.

## Verification

- Typecheck/build clean.
- Playwright: open `/deckmo`, confirm the header shows "Thesis" on the opening
  slide and updates when navigating to a later section (e.g. "The Ask" on the
  close), footer and presenter view show the same names.
