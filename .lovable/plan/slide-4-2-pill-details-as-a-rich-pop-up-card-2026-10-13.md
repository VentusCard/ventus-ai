# Slide 4.2: pill details as a rich pop-up card

## What changes
- Clicking any signal pill on 4.1/4.2 opens a pop-up card anchored next to that pill, instead of the detail section below the story. The bottom detail section is removed.
- One card open at a time; clicking the pill again, the close button, outside the card, or Escape closes it. Clicks never change slides; arrow keys still navigate (and close the card).
- Card layout (light theme, family color accent, ~520px wide, max height fits the screen with its own scroll):
  1. Header: family label, Internal/External badge, signal summary headline.
  2. Key facts grid (cadence, pattern, numbers already in the signal details).
  3. Financial pills: observed monthly payments table, with the annualized-estimate note for Amex.
  4. Supporting transactions in enriched form: each row shows date, clean merchant name with category icon, category / subcategory, cadence tag (recurring or one-off), amount, and the raw descriptor in small monospace beneath — not collapsed.
  5. External pills: provider evidence (detail, provider, timing, confidence) instead of transactions, clearly labeled as outside data.
- Card flips above/below or left/right automatically to stay on screen at all desktop sizes.

## Technical details
- RickySignalStory.tsx: wrap each pill Button in a shadcn Popover (controlled by existing selectedLabel); move detail content into PopoverContent (collision-aware, `max-h-[min(70vh,640px)] overflow-y-auto`); stop Escape/arrow propagation issues so deck keyboard nav still works; remove detail section and scrollIntoView effect.
- Enriched rows use existing fields on RICKY_TRANSACTIONS (merchant, category, signals, raw description); no new fixture data, no invented amounts.
- base.css: small deck-scoped styles for the card accent; no dark-mode utilities.
- Update deckmoSignalStory tests if they reference #ricky-story-detail; verify with Playwright at 1375×842, 1691×1011, 1024×768.
