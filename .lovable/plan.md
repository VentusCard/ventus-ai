

## Two Changes to Executive Demo

### 1. Move Persona Line Below Customer Name (Left Panel)

Currently the persona title (e.g., "🏌️ Golf & Wellness Enthusiast") appears in the middle intel panel. Move it to display directly beneath the customer name in the left panel's customer selector card.

**`ExecDemoLeftPanel.tsx`**
- Add `personaTitle` prop (string, from `execProfile.persona.title` / `execProfile.persona.icon`)
- Render it as a small italic line below the customer name/segment line in both the pre-built and custom customer cards (only visible when `phase !== "idle"`)

**`ExecDemoIntelPanel.tsx`**
- Remove the persona icon + title header row from the persona card (lines 99-103), since it now lives in the left panel

**`ExecDemoPage.tsx`**
- Pass `personaTitle` and `personaIcon` down to `ExecDemoLeftPanel`

### 2. Clickable Pills → Filter Transactions on Left Panel

When a user clicks a signal pill (e.g., "Airlines 3x") in the intel panel, the left panel should highlight only the transactions associated with that pillar+label combo.

**Data flow**: Each `SignalEntry` in `signalMap` is keyed by transaction index. So clicking a pill with `{pillar, label}` means we need to find all transaction indices `i` where `signalMap[i].pillar === pillar && signalMap[i].label === label`.

**`ExecDemoPage.tsx`**
- Add `activePillFilter` state: `{ pillar: string; label: string } | null`
- Add `handlePillClick(pillar: string, label: string)` — toggles the filter (click again to clear)
- Derive `filteredIndices` from `execProfile.persona.signalMap` matching the active pill
- Pass `activePillFilter` to `ExecDemoIntelPanel` (for visual active state on the pill)
- Pass `filteredIndices` to `ExecDemoLeftPanel` (for highlighting)

**`ExecDemoIntelPanel.tsx`**
- Add `activePillFilter` and `onPillClick` props
- Make `AnimatedChip` clickable with `onClick={() => onPillClick(pillar, label)`
- Add a visual active/selected state (stronger border, slight scale) when the chip matches `activePillFilter`

**`ExecDemoLeftPanel.tsx`**
- Add `filteredIndices` prop (number[] | null)
- In the `hold` phase (and `cardCycle`), when `filteredIndices` is set:
  - Show filtered transactions at top, highlighted
  - Dim all other transactions below
  - Show a small "Showing N transactions for [label]" header with a clear button

### Files
1. `src/pages/ExecDemoPage.tsx` — state for pill filter, derive filtered indices, pass props
2. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — clickable pills, remove persona title header, active pill styling
3. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — persona title under name, filtered transaction view

