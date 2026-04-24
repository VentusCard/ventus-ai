

## Add ski gear & season pass transactions to Sarah Mitchell

Sarah's CSV (`SAMPLE_CSV` in `src/lib/sampleData.ts`) feeds the /demo executive demo for customer #1. It currently spans Nov 2024 → Jul 2026 — covering two ski seasons (2024-25 and 2025-26). I'll add **2 annual season passes + 4 ski gear purchases** (2 per year), interspersed in chronological order to match the existing date flow.

### New transactions (6 total)

**Season 2024-25** (added before existing Nov 2024 ski entries):
- `EPIC PASS VAIL RESORTS` — Annual ski season pass — MCC 7941 — $1,089.00 — 2024-10-28 — 81657 — Premium Card
- `CHRISTY SPORTS DENVER` — Ski jacket and pants — MCC 5941 — $685.00 — 2024-11-15 — 80202 — Premium Card
- `EVO.COM` — All-mountain skis with bindings — MCC 5941 — $1,249.00 — 2024-12-09 — 98101 — Premium Card

**Season 2025-26** (added in fall 2025 → winter 2026 window):
- `EPIC PASS VAIL RESORTS` — Annual ski season pass renewal — MCC 7941 — $1,149.00 — 2025-10-12 — 81657 — Premium Card
- `BACKCOUNTRY.COM` — Ski helmet and goggles — MCC 5941 — $389.00 — 2025-11-20 — 84097 — Premium Card
- `REI CO-OP SF` — Ski boots and base layers — MCC 5941 — $725.00 — 2026-01-22 — 94102 — Premium Card

Transaction IDs will use unused slots / sequential numbering (`txn_056`–`txn_061`) appended logically; rows inserted in date order so the existing chronological flow is preserved.

### Why these choices
- **MCC 7941** (Commercial Sports) for season passes — matches existing `VAIL RESORTS LIFT TKT` / `PALISADES TAHOE LIFT` rows.
- **MCC 5941** (Sporting Goods) for gear — matches the existing `WILSON SPORTING GOODS` row.
- **Premium Card** source for high-ticket discretionary purchases — consistent with [Transaction Sources memory](mem://technical/data-processing/transaction-source-logic).
- Realistic merchants (Epic Pass, evo, Backcountry, Christy Sports, REI) reinforce the existing "Wellness Explorer / ski enthusiast" lifestyle signal already showing in Sarah's Sports pillar.

### Files touched
- `src/lib/sampleData.ts` — insert 6 rows into `SAMPLE_CSV` template literal in chronological order.

No other changes — `summarizeCsv()` in `demoData.ts` recomputes spend/counts automatically, and the enrichment pipeline will pick up the new rows for the Sports pillar, deals, and lifestyle persona output.

