# Slide 8.1 chat answer: split Dining and Experiences

## What changes
The Hawaii spending answer on slide 8.1 currently groups restaurants and activities together as "Dining & Experiences" ($990). The user wants them as two separate categories.

New breakdown becomes four groups:

```text
Lodging     — $7,420  (Hilton Waikoloa Village, Grand Wailea Resort, Koa Kea Hotel Kauai)
Air Travel  — $2,705  (Hawaiian Airlines HNL)
Dining      — (Luau Kalamaku Kauai, Beach House Restaurant Kauai, Mama's Fish House Maui)
Experiences — (Boss Frog Snorkel Tour, and any other activities/tours)
Total: $11,115 (unchanged)
```

## How
- In `src/components/deckmo/DeckmoBankdemoScenes.tsx`, split the current combined "Dining & Experiences" grouping into two:
  - **Dining**: restaurant rows (restaurant / fast-food category MCCs)
  - **Experiences**: tours, luaus, attractions, and other activity rows
- Update the answer instructions from "exactly three categories" to four categories (Lodging, Air Travel, Dining, Experiences), each with its subtotal and merchants, then the grand total — still never as a footnote.
- The grand total ($11,115) does not change; this only re-splits the $990 combined line.

## Verification
- Open slide 8.1, send the Hawaii question, confirm the answer shows four groups with Dining and Experiences separated and the total unchanged.
- Check at 1540x855 (current viewport).
- Confirm build/typecheck stays clean.
