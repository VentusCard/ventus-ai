

## Reverse Beat 3: Show MCC First, Then Reveal What It Could Mean

**File**: `src/components/demo/DemoPasswordGate.tsx`

### Concept

Flip the reveal order of Beat 3. Currently it shows three icons (Symphony, Celtics, Monster Jam) first, then converges them into "MCC 7922 · Entertainment". The new flow:

- **Phase 0 (initial)**: Show the MCC code prominently at the top — `MCC 7922 · Entertainment`. A single opaque code. The audience sees what the bank sees: one generic label.
- **Phase 1 (on advance)**: The three possibilities fan out below — Symphony Orchestra, Celtics Tickets, Monster Jam — revealing that this single code could mean any of these wildly different experiences. The "it could mean anything" moment.

### Technical details

- **beat3Phase** already supports 0→1 progression (lines 34-40). No state changes needed.
- Restructure the Beat 3 JSX (lines 332-398):
  - Move the MCC 7922 badge to the top, always visible (phase 0).
  - Update heading/copy to set up the reveal: "What does MCC 7922 mean?" or similar.
  - Move the three icon circles below, gated by `beat3Phase >= 1` with diverging connector lines from the MCC badge down to each icon.
  - Connector lines fan outward (reverse of current convergence).
- Update `BEAT_SUMMARIES[3]` if needed to match the new narrative direction.

