# Section 6 beats — two-line captions like section 5

## Goal

Section 6's five beat captions are currently single-line strings. Section 5's beats render as cards with a bold title plus a second body line. Rework section 6's captions into that same two-line format, expanding each so the body line adds the supporting detail while keeping the current meaning.

## Changes (data only — `src/lib/deckmoScript.ts`, `midTerm.popups`)

No component changes: `CalloutRail` already renders `{ title, body }` objects exactly like section 5.


| #   | Today (one line)                                   | New title                              | New body line                                                           |
| --- | -------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Aggregated deals, rewards, perks in one place      | Deals, rewards and perks in one place  | Merchant deals, bank products, musuem perks, all in one place.          |
| 2   | Curate from multiple deal aggregators              | Curated from multiple deal aggregators | The best available offers are sourced across partners, not one catalog. |
| 3   | Next-gen tools such as semantic search             | Next-gen tools like semantic search    | Customers find relevant offers by meaning, not exact keywords.          |
| 4   | A collection of deals for every major signal       | A collection for every major signal    | Habits, life events and routines each get their own deal collection.    |
| 5   | Behavioral-boosting hyper-personalized collections | Hyper-personalized collections         | Multi-category collection that supports sepcific goals.                 |


Copy stays within the established tone rules (no stress/risk language, no specific counts).

## Verification

- Playwright at 1691×1011 and 1540×855: step through beats 6.1–6.5, confirm each caption card shows a bold title with a one-line body beneath it, matching section 5's card style, with no clipping or layout shift.
- Build clean.