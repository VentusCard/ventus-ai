# HYSA Card Label: "Est. Benefit" → "Est. Earnings"

## What changes

The High-Yield Savings card in section 7 of /deckmo currently labels its total as
"Est. Benefit $1,550". Since $1,550 is the sum of $1,050 interest and the $500
bonus, "Earnings" is the accurate, natural wording for a savings product.

Change the label to "Est. Earnings $1,550".

## Where

- `src/lib/deckmoBankdemoFixture.ts` (~line 80): the HYSA card's
  `estimated_label` field — change `"Est. Benefit"` to `"Est. Earnings"`.
- No other files: the value stays `$1,550`, the three benefit lines, the quote,
  the CTA, and the rotation behavior are untouched. The mortgage and rewards
  cards keep their own labels.
- `/bankdemo` and `/demo` are unaffected — this field exists only in the deck
  fixture.

## Verification

- Check build output is clean.
- In a browser, open /deckmo (password gate), go to section 7.3, confirm the
  rotating HYSA card reads "Est. Earnings $1,550" with nothing clipped at
  1376×1011 and 1903×1024.
