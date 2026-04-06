

## Pillar-Grouped Pill Layout

### What Changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

Currently pills render in a single `flex-wrap` cloud sorted by spend. Change to:

1. **Group chips by pillar** — derive a `Map<string, ChipData[]>` from `chips`, preserving pillar order of appearance
2. **Render each pillar as its own row** — a pillar header (colored dot + name) followed by its chips in a horizontal `flex-wrap` row. Remove the separate legend block since pillar names now inline as row headers.
3. **Remove `maxHeight` constraint** on the pill container before synthesis — let it take as much vertical space as needed (`overflow-y: auto` on the whole persona card instead). The persona section becomes scrollable if it exceeds available space.
4. **On "Synthesize Persona" click** — the existing collapse animation plays, shrinking rolled-up pill rows. After synthesis, the collapsed view with rollup pills + toggle stays compact as it does today.

### Layout (before synthesis)
```text
┌─ Persona Card ──────────────────────┐
│ "Evolving description..."           │
│ [✦ Synthesize Persona]              │
│                                     │
│ ● Health & Wellness                 │
│   [Gym 3× $1.2k] [Spa 2× $800]    │
│                                     │
│ ● Travel & Exploration              │
│   [Hotels 4× $3k] [Airlines $2k]   │
│                                     │
│ ● Entertainment & Culture           │
│   [Concerts $500]                   │
└─────────────────────────────────────┘
```

### Specific edits

- Create a `chipsByPillar` memo that groups `chips` array by `chip.pillar`, maintaining insertion order
- Replace the flat pill cloud div (lines 292-310) with a pillar-grouped layout: for each pillar, render a small header row then its chips
- Remove the separate legend block (lines 278-289) — redundant once pillar names are row headers
- Remove `maxHeight` style from the pill container when `!synthesisTriggered`; keep `maxHeight: 100` only after synthesis is triggered (for the collapsed evidence view)
- The persona card div gets `overflow-y: auto` to scroll if content exceeds viewport

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

