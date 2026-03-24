

## Compact Beat 5 Cards — Keep Vertical, Remove Bloat

The user wants to keep the vertically stacked layout but make each card compact — just mentioning the functions, no expanding details or progress bars.

### Changes to `src/components/demo/DemoPasswordGate.tsx`

**1. Simplify beat5Phase logic (line 49)**
- Change `beat5Phase < 3` → `beat5Phase < 1` — only two phases: 0 (signal+demographics) and 1 (all cards appear).

**2. Replace lines 542–664** — compact all three cards:

Each card becomes a simple block: icon + title + 1-line subtitle. No expanding phases, no inner containers, no progress bars, no dollar amounts.

- **🎁 Personalized Rewards** — "Hyper-targeted deals matched to life stage & location"
- **🤝 Personalized Relationship** — "Advisor intelligence triggered with life event context"
- **📱 Personalized UX** — "New 'Family & Foundation' spending pillar auto-created"

Remove all phase 2/3 gating, expansion animations, inner bullet lists, progress bars, and the nested white card. Each card is ~6 lines of JSX: a `rounded-xl border p-4` div with icon+title row and a subtitle line.

**File**: `src/components/demo/DemoPasswordGate.tsx`

