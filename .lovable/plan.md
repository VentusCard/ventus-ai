Fix repeated / too-similar names in the WM Coworker Advisor digest by rendering one signal per client, and diversify the underlying name pool.

## Root causes
1. `AdvisorNotificationsView.tsx` currently renders one row per detected event, so a client with multiple events appears multiple times, making names look repeated.
2. `topTwo` (drives `nameA`/`nameB` in reply messages 2–7) slices the first two rows without checking `client.id`, so both can be the same person.
3. `firstNames` (15) × `lastNames` (15) in `src/lib/randomProfileGenerator.ts` is a small pool; last names visibly repeat across the digest even when full names are unique.

## Changes

### `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx`
- One signal per client, everywhere in the digest:
  - When flattening clients → rows, pick each client's single highest-urgency (then highest-confidence) event and drop the rest.
  - Section assignment uses only that chosen event.
  - Dedupe by `client.id` across the entire digest so the same client never appears in two sections.
- `topTwo` picks two rows with distinct `client.id`s (falls back gracefully if only one client is available).
- Section caps stay as previously planned (Act Now 3, Opportunities 3, At Risk 2).

### `src/lib/randomProfileGenerator.ts`
- Expand `firstNames` to ~40 diverse entries (e.g. Priya, Marcus, Elena, Rafael, Yuki, Diane, Nadia, Charles, Peter, Sofia, Thomas, Rachel, Andre, Beatrice, Kenji, Olivia, Nathan, Camille, Julian, Isla, Vikram, Naomi, Grace, Ethan, Miriam, …).
- Expand `lastNames` to ~40 diverse entries (e.g. O'Brien, Kim, Rossi, Vasquez, Nakamura, Freeman, Ito, Alvarez, Henderson, Nguyen, Okafor, Sørensen, Blackwood, Delgado, Petrov, Bhatia, Rivera, Whitman, Ross, Sato, Larsen, Gomez, Novak, Fischer, …).
- Keep existing `usedNames` unique-full-name dedup.

## Out of scope
- `src/lib/fviData.ts` name lists (separate demo).
- Coworker Inbox thread personas in `coworkerInboxData.ts` (hand-authored).
