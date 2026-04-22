

## Hero animation: keep existing format, just enrich each row inline

Keep the current `ScrollDrivenHero` 3-stage scroll exactly as-is — same card, same flow, same persona highlight. The only change is what each transaction row **looks like** in Stage 2/3, plus a small data refresh so the three capabilities are visible inside that single row.

### New row format

Each enriched row becomes a single line carrying all three signals:

```
Pottery Barn Kids   PAYPL *POTTRY BRN KDS 4829   Cashback Card   #parent
```

Visually (left → right inside the existing row, no new columns, no new height):

- **`Pottery Barn Kids`** — clean merchant name. White, semibold, 12px. *(descriptor cleaning)*
- **`PAYPL *POTTRY BRN KDS 4829`** — raw descriptor. Mono, 9px, gray-500, opacity 0.55, truncates first when space is tight. *(provenance / proves the cleaning)*
- **`Cashback Card`** / **`Checking · ACH`** / **`Checking · Check #1247`** / **`Checking · Zelle`** — rail + funding source. Mono, 9px, colored pill matching the rail. *(cross-rail intelligence)*
- **Category pill** — unchanged, far right. *(existing)*

So a viewer reads: *clean name → the gibberish we cleaned → which rail it came from → what bucket it fell into.* All on one line. No new stage, no new banner, no new animation.

### Three capabilities, inline

**1. Descriptor cleaning** — every row now shows the raw descriptor as a faint subline beside the clean merchant. The sample set is curated so each visible row demonstrates a real cleaning pattern:

| Raw (shown faint) | Clean (shown bold) |
|---|---|
| `PAYPL *POTTRY BRN KDS 4829` | Pottery Barn Kids |
| `SQ *MARRIOTT HTL MIA 8821` | Marriott Miami |
| `TST* OLIVE GARDEN #2241` | Olive Garden |
| `CHECKCARD WHLFDS MKT #1023` | Whole Foods Market |
| `ACH DEBIT PRINCETN REVW EDU` | Princeton Review |
| `DD *DOORDASH SF` | DoorDash |

**2. Cross-rail intelligence** — the funding-source label on each row is one of:
- `Cashback Card` (gray)
- `Checking · ACH` (blue)
- `Checking · Check #1247` (amber)
- `Checking · Zelle` (purple)
- `Brokerage · Wire` (red)

Inferred from the raw descriptor (`CHECK #` → Check, `ZELLE` → Zelle, `ACH ` / `WIRE ` → ACH/Wire, else Card). Two rows are added so checks, Zelle, ACH, and a wire are all visible at once: `CHECK #1247 YALE UNIV $32.00`, `ZELLE PAYMENT COLLEGE COUNSELOR $850`, `ACH CREDIT IRS REFUND $2,847`, `WIRE OUT MORGAN STANLEY $5,000`.

**3. More supporting evidence per signal (3–5)** — when a persona is active in Stage 3, that persona's matching rows float to the top of the list (animated reorder, ~300ms). Non-matching rows dim to 0.08 as today. Card transaction-list height bumps from `200px` → `255px` so all 3–5 supporting rows clear the gradient fade. The active persona pill echoes the count: `Frequent Traveler · 5 txns`. Sample data is tuned so each persona has exactly 5 clearly-named supporting transactions across at least 2 rails.

### Stage behavior — unchanged

- Stage 1: raw stream scrolls (same as today).
- Stage 2: raw stream swaps to the new enriched row format above.
- Stage 3: persona reorder + dim, floating callouts unchanged.

No new stages. No new banners. No new section. Just a richer row inside the existing card.

### Files touched

- `src/components/ScrollDrivenHero.tsx` — only file. Changes:
  - Curate `rawTransactions` (swap ~6 rows for cleaning-pattern examples; add 2–3 cross-rail rows).
  - Extend `EnrichedRow` with `rail: "CARD" | "ACH" | "CHECK" | "ZELLE" | "WIRE"`, `railLabel: string`, `railColor: string`. Infer from raw.
  - Update the Stage 2/3 row template to render: clean merchant · faint raw · rail pill · existing category pill, all on one line (flex with min-width / truncate on the raw segment).
  - Bump list height `200 → 255`. Add Stage 3 reorder so active persona's rows float to top.
  - Echo `· N txns` in the active persona pill.

No new files, no data sources, no edge functions, no schema work.

