

## Show Tab Buttons Below Pills (No Content Until Synthesis)

### What Changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

Currently the entire tabbed intelligence section (buttons + content) only renders when `showTabs` is true. The user wants the 3 tab buttons always visible below the pills once enrichment starts, but the tab *content* should only appear after synthesis shrinks the pills.

1. **Extract tab bar** from inside the `showTabs` conditional (~line 333). Render it whenever `showProfile && phase !== "idle"` — as a `shrink-0` element pinned below the persona card.
2. **Tab buttons render disabled** (dimmed, `text-slate-300`, `cursor-default`) until their tab is in `revealedTabs`. Same styling as today's unrevealed state.
3. **Tab content area** stays inside `showTabs` conditional — only renders when tabs are actually revealed with data.
4. **Persona card keeps `flex-1 min-h-0`** until `synthesisTriggered` (not until `showTabs`). This means the pills fill all available space above the 3 buttons.
5. **On synthesis click** — persona card shrinks (`maxHeight: 45vh`), tab content area appears below and gets `flex-1`.

### Layout

```text
Before synthesis:
┌─ Persona Card (flex-1) ─────────────┐
│ description...                      │
│ [✦ Synthesize Persona]              │
│ ● Health & Wellness                 │
│   [Gym $1.2k] [Spa $800]           │
│ ● Travel                           │
│   [Hotels $3k] [Airlines $2k]      │
│         (fills remaining height)    │
└─────────────────────────────────────┘
┌─ Tab Bar (shrink-0) ────────────────┐
│ [Analytics] [Rewards] [Relationship]│  ← dimmed/disabled
└─────────────────────────────────────┘

After synthesis:
┌─ Persona Card (maxHeight: 45vh) ────┐
│ ✦ Headline                          │
│ [Rollup pills]                      │
└─────────────────────────────────────┘
┌─ Tab Bar ───────────────────────────┐
│ [Analytics] [Rewards] [Relationship]│  ← active
└─────────────────────────────────────┘
┌─ Tab Content (flex-1) ──────────────┐
│ ...                                 │
└─────────────────────────────────────┘
```

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

