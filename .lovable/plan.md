

## Diversify the Frequent Traveler signal — show lifestyle, not just bookings

Right now all 5 travel-tagged rows are flights and hotels (Delta, Southwest, Marriott, Hilton, Stanford Guest House), which makes "Frequent Traveler" read like *"this person books trips"* instead of a full lifestyle signal. We'll keep the bookings but route them through a dedicated **Travel Card** rail, and replace 3 of them with broader, higher-ticket travel-lifestyle merchants so the cluster of evidence reads richer.

### New travel evidence set (5 rows)

| Raw descriptor | Clean merchant | Rail | Why it matters |
|---|---|---|---|
| `TRAVELCARD *MARRIOTT HTL MIA` | Marriott Miami | **Travel Card** | Booking — premium card use |
| `TRAVELCARD DELTA AIR 0062139` | Delta Air Lines | **Travel Card** | Booking — airline loyalty |
| `CHECKCARD RIMOWA NYC FLAGSHIP` | Rimowa | Cashback Card | Premium luggage ($800+) — frequent traveler upgrades gear |
| `APPLPAY GLOBAL ENTRY GOV` | Global Entry | Cashback Card | International infrastructure (5-year membership, $100) |
| `CHECKCARD VIATOR *PRVT TOUR` | Viator | Cashback Card | In-destination experiences ($200–500 per booking) |

Removed from the travel cluster: Southwest Airlines, Stanford Guest House, Hilton Garden Inn — replaced by Rimowa, Global Entry, Viator.

### Why this works

- **3 of 5 rows are non-bookings** — proves we detect travel as a *lifestyle pattern*, not just by hotel/airline MCCs. Anyone can flag "DELTA AIR" as travel; recognizing Rimowa + Global Entry + Viator as the *same* persona is the differentiator.
- **Lifestyle ladder visible** — gear (Rimowa) → infrastructure (Global Entry) → in-destination spend (Viator). That's the full traveler journey on one card, not just bookings.
- **The 2 booking rows now show "Travel Card"** as their funding source — reinforces the cross-rail story and looks more realistic (premium customers route flights/hotels to a travel-rewards card).
- **Same row count (5), same callout layout** — no structural changes.

### New rail type

Add `"TRAVEL"` to the `Rail` union and to `inferRail`:
- Detect descriptors starting with `TRAVELCARD` → `{ rail: "TRAVEL", railLabel: "Travel Card", railColor: "#0ea5e9" }` (sky-blue, distinct from the gray Cashback Card and the darker-blue ACH).

### Updated floating callout copy

Change:
> *"5 travel transactions · Hotels, flights, campus visits"*

To:
> *"5 transactions · Flights, lodging, premium luggage, Global Entry, tours"*

### Files touched

- `src/components/ScrollDrivenHero.tsx` only:
  - `rawTransactions` — swap 3 rows + relabel 2 booking rows with `TRAVELCARD` prefix
  - `Rail` type — add `"TRAVEL"`
  - `inferRail` — add `TRAVELCARD` branch
  - `enrichedData` map — add cases for Rimowa, Global Entry, Viator (all `persona: "travel"`); Marriott/Delta keep `persona: "travel"`
  - `personas[0].callout` — new copy

No new files, no schema, no edge-function work.

