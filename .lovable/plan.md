# Slide 8.1: Hawaii trip answer and cleaner chat

## What changes
1. **New opening question.** The question on 8.1 becomes "How much have I spent on my trip to Hawaii?"
2. **Dining and experiences go into the total.** Right now the answer counts only hotels and flights, and restaurants get a side note. The new answer puts dining and experiences in the main breakdown and the total, next to Lodging and Air Travel. That includes Beach House Restaurant, Luau Kalamaku, and Mama's Fish House.
3. **No suggestion pills.** The row of three suggestion buttons under the chat ("What offers do I have?" and the others) is removed on this slide. Typing your own follow-up question still works.

## Details
- The assistant gets a full list of Ricky's Hawaii purchases (flights, hotels, restaurants, luau, and other activities). Its instructions say to group them as Lodging, Air Travel, and Dining & Experiences, add all three into one total, and never treat restaurants as a footnote.
- The three suggestion buttons disappear only on this slide. The /demo chat keeps them.
- Everything else on the slide stays the same: the callouts, the layout, and live follow-up questions.

## Technical details
- `src/lib/deckmoScript.ts`: set `retention.openingPrompt` to "How much have I spent on my trip to Hawaii?"
- `src/components/deckmo/DeckmoBankdemoScenes.tsx` (RetentionPhone): build `chatSignalContext` from the Hawaii rows in `DECKMO_BANKDEMO_FIXTURE.enrichedTransactions`. Match on Hawaii merchants and zips starting with 967, and list each row as merchant, amount, date, and category. Add explicit grouping and total rules.
- `ConsumerAIChatView.tsx` and `ExecDemoPhoneView.tsx`: add an optional `hideQuickActions` prop (default false) and pass it only from RetentionPhone. It hides the quick-actions row.
- Verify on 8.1 at 1540×855: the new question appears, the live answer lists dining and experiences in the total, and no suggestion row shows.
