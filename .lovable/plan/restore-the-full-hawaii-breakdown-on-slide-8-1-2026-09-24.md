# Restore the full Hawaii breakdown on slide 8.1

## Problem
The Hawaii purchases in Ricky's data happen on several different dates. When we added the "Dec 2025" header, the assistant began keeping only the purchases that fit that month. That dropped Koa Kea, Luau Kalamaku, Beach House and more, so the total fell from $11,115 to $7,084.

## Fix
- Keep the header exactly as "Your Dec 2025 Hawaii trip spend breakdown:".
- Treat every Hawaii purchase as part of that one trip, so the answer always lists all four groups with the full $11,115 total:
  - Lodging — $7,420 (Hilton Waikoloa Village, Grand Wailea Resort, Koa Kea Hotel Kauai)
  - Air Travel — $2,705 (Hawaiian Airlines HNL)
  - Dining — $801 (Luau Kalamaku Kauai, Beach House Restaurant Kauai, Mama's Fish House Maui)
  - Experiences — $189 (Boss Frog Snorkel Tour)

## Technical details
- In `DeckmoBankdemoScenes.tsx`, remove the per-row `date` from the rows sent to the assistant in HAWAII_CHAT_CONTEXT. The model then has no dates to filter on.
- Add pre-computed group subtotals (Lodging, Air Travel, Dining, Experiences) plus the grand total to the context. Add a strict rule: "All listed purchases belong to this one trip; include every one. Use these exact subtotals and total."
- Check in the live preview at 1590×855 that the answer shows the Dec 2025 header, all eight merchants and $11,115.
