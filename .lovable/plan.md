# Transaction Detail Page: Bigger Text, No Scroll

## Goal
On the deck's phone transaction detail screen (slide 5, all transactions including the JFK confirmation detail), increase text sizes for readability while making the whole detail fit inside the phone screen without scrolling, by using the available width and tightening vertical spacing.

Current state (measured at 1540×855): the detail content overflows its scroll container by ~60–100px; at 1024×768 it overflows more. Text is very small (7–11px).

## File
`src/components/deckmo/DeckmoRecentTransactionsTab.tsx` (detail screen section only — list screen, /demo, and other slides untouched).

## Changes

### 1. Bigger type throughout the detail screen
- Merchant name and amount: 15px → 18px bold.
- Back / screen title row: 10–11px → 11–12px.
- Details card: section label 8px → 9px; row labels 9px → 10px; values 9px → 10.5px; original statement mono line 11px → 13px.
- Checks items: 9px → 10.5px; icons slightly larger.
- OUR BANK INSIGHTS: header 8px → 9px; body copy 9px → 10.5px.
- Action buttons and Undo: text 9px → 10.5px, height 28px → 30px.
- Correction form input and buttons sized to match.

### 2. Use space better (keep all copy and functionality)
- Reduce outer padding of the detail body (`px-4 pb-5 pt-4` → `px-3.5 pb-3 pt-3`) and card padding (`p-3` → `p-2.5`).
- Tighten vertical rhythm: `mt-4`/`mt-3` section gaps → `mt-2.5`; Details row spacing → `space-y-1`.
- Put Category / Payment rail / Account on tighter rows and let the original statement keep its own full-width line.
- Sticky header row slightly shorter (`py-2` → `py-1.5`).
- Correction form (when opened) uses the same compact rhythm so it fits too.

### 3. Small-height viewport variant
The phone shrinks below 800px-tall viewports (e.g. 1024×768). Add `[@media(max-height:800px)]` overrides so the enlarged text steps down one size there (still larger than today) and the layout still fits without scroll.

## Constraints
- Strict light theme, existing colors/borders/cards unchanged.
- All copy, buttons, confirmation/correction/Undo/chat flows, and beat navigation (5.4 = JFK detail) unchanged.
- List screen and other deck phones untouched.

## Verification
Playwright at localhost:8080:
1. Unlock deck ("ventus2026"), walk to slide 5, open each of the main transactions plus the JFK detail (5.4).
2. Measure the detail scroll container at 1024×768, 1540×855, 1920×1080 — `scrollHeight` must equal `clientHeight` (no scroll) with the enlarged text.
3. Screenshots at 1540×855 and 1024×768 to confirm readability and no clipping; test "No, that's not right" correction form still fits.
4. Build/typecheck clean.
