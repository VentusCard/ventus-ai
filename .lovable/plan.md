# Beat captions audit — one line each, same information

## Goal

Sections 5 and 8 still render each beat caption as a card with a bold title plus a wrapping body line (two text rows). Sections 6 and 7 already use single-line captions, which the user approved. Bring sections 5 and 8 to the same style: one line per beat, keeping the information from title + body, condensed rather than cut.

## Changes (data only — `src/lib/deckmoScript.ts`)

No component changes: `Callouts` already renders plain strings as a single bold line.

### Section 5 (immediate) — 5 popups become one-liners

| # | Today (title + body) | New one-liner |
| - | --- | --- |
| 1 | Every charge, instantly recognizable / Cryptic statement strings become clean merchant names and locations. | Cryptic charges instantly become clean merchant names |
| 2 | Context behind every purchase / Each transaction carries a category and a lifestyle pillar, not just an amount. | Every purchase carries a category and a lifestyle pillar |
| 3 | Recurring patterns surface automatically / Subscriptions and repeat activity are identified without the customer lifting a finger. | Subscriptions and repeat activity surface automatically |
| 4 | Plain-language answers, self-served / A tap explains the charge from the customer's own activity — no call to the bank needed. | A tap explains any charge — no call to the bank needed |
| 5 | Confirmed by the customer / One tap closes the loop. The answer improves every future explanation. | One tap confirms it and improves future explanations |

### Section 8 (retention) — 3 popups become one-liners (same format, for consistency)

| # | Today | New one-liner |
| - | --- | --- |
| 1 | Understand the full context / Answer from enriched activity across the customer's relationship… | Answers come from the customer's full financial context |
| 2 | Remove everyday friction / Give customers useful answers without making them search, repeat themselves, or leave the experience. | Useful answers with no search, repeats, or detours |
| 3 | Earn the next interaction / Consistently relevant help deepens engagement and creates the conditions for stronger retention and NPS. | Consistent relevance builds engagement, retention and NPS |

Copy stays within the established tone rules (no stress/risk language, no specific counts).

## Verification

- Playwright at 1691×1011 and 1540×855: open sections 5 and 8, confirm each caption renders as a single line (element height ≈ one text line, no wrap) and nothing else shifts.
- Build clean.
