# Immediate Value — enriched transaction history tab

## Goal

Rebuild the phone content on the "Immediate Value" beat of /deckmo as a user-facing **Recent transactions** tab: a normal chronological list of the customer's latest activity. For this presentation sample, the six most recent entries happen to span six different payment rails. Tapping a row reveals progressively richer detail — showing how Ventus turns messy ledger strings into transaction history customers actually understand.

## Design

**Phone tab: "Recent transactions"** (replaces the current budget-tab content on the Immediate Value beat only; mid-term and long-term beats keep their phone tabs)

- Account header line ("Our Bank checking") then a date-descending list of the six latest enriched transactions. The UI presents them as ordinary recent activity, not as a rail showcase; the selected sample simply includes CARD, ACH, CHECK, WIRE, RTP, and ATM.
- Each row at rest shows the enriched state: clean merchant name, category · lifestyle pillar, amount, and a small color-coded rail chip — the "after" state. The raw ledger string appears only inside the expanded detail as the "before".
- Rows are tappable. Tapping expands the row through detail tiers:
  - **Tier 1 — Recognized:** clean merchant name, logo-style initial, category/pillar, rail chip.
  - **Tier 2 — Understood:** the original raw ledger string shown struck-through or muted as "Was: SQ *NORTHSTAR 4471", plus pattern context (e.g. "Recurring · every other week").
  - **Tier 3 — Explained:** a plain-language explanation line ("This appears to be your recurring tennis club visit…") with a subtle "Yes, that's mine" confirmation affordance — echoing the existing explainer beat.
- Only one row expanded at a time; tapping another row collapses the previous. Expansion animates with a short height/opacity transition, disabled under reduced-motion.
- The right-hand CalloutRail and the four-beat step choreography stay as-is; beats still drive the callouts while the Activity tab is interactive throughout.

## Copy (representative, six rails)

| Rail | Raw | Clean | Pattern context |
|---|---|---|---|
| CARD | SQ *NORTHSTAR 4471 | Northstar Market | Weekly grocery run |
| ACH | ACH DEBIT CITYUTIL 8841 | City Utilities | Monthly autopay |
| CHECK | CHECK #1042 | Greenfield Landscaping | Quarterly service |
| WIRE | WIRE OUT REF 88213 | Escrow — Home Closing | One-time |
| RTP | ZELLE TO M. CHEN | Split dinner with Mia Chen | Occasional P2P |
| ATM | ATM WDL 500 FELL ST | Cash withdrawal — Fell St | Near home |

(Final wording confirmed at build; no specific spend totals beyond the demo amounts, per copy rules.)

## Technical

- New component `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`: static, deterministic, deck tokens + strict light theme; local `useState` for the expanded row; no live data or Supabase.
- Data added to `DECKMO.immediate` in `src/lib/deckmoScript.ts` as an `activity` array (rail, raw, clean, meta, pattern, explanation, confirmation label).
- `BankdemoImmediate` in `src/components/deckmo/DeckmoBankdemoScenes.tsx` swaps `ExactPhone tab="budget"` for a phone frame rendering `DeckmoActivityTab`; PhoneScene/ExactPhone stay for the other beats.
- Scene copy (eyebrow/title/subtitle/callouts) and beat count (4) unchanged unless spacing requires a tweak.
- Verify at 1024×768, 1540×855, 1920×1080 and reduced-motion: rows tap through tiers, one-open-at-a-time works, no clipping in the 620px phone frame, `bunx tsgo --noEmit` clean, build OK.
