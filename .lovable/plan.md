# Make the Intelligence pipeline one cohesive system + de-cramp the Core header

## What the screenshot shows today

The three columns of the pipeline board were each styled in a separate pass, so they don't feel like one product:

- **Data sources (left)** — new cards: 15px name, 12.5px sublabel, two tinted pills, "Live" dot. Names truncate ("External Intellig…"), pills wrap onto two lines on the external cards, and the section header ("Data sources / 2 groups · 33 sources") wraps into three lines in a narrow column.
- **Intelligence Core (center)** — dark navy panel with saturated per-family cards, 24h counts, and rolling evidence tickers. Visually the loudest element by a wide margin.
- **Activation destinations (right)** — a different card grammar again: 3px team bar, tinted team chip, then a truncated destination name and a mono channel chip. Names truncate hard ("Intellig…", "Automati…", "Personali…"), so the column mostly shows team labels, not destinations.
- Column widths are unbalanced: left and right are too narrow for their content while the center panel takes the most space.
- Three unrelated caption treatments coexist: mono uppercase eyebrows, an italic serif-ish caption ("Every Customer, Every Colleague"), and mono meta counts.

## The cohesive direction

One grammar across all three columns: **eyebrow → count → uniform rows → status**. Sources are the input, the Core is the engine, destinations are the output; they should look like the same machine at three stages.

### 1. Rebalance the grid

Change the pipeline grid from center-heavy to roughly equal thirds (e.g. `1.05fr / connector / 1.15fr / connector / 1.05fr`) so no column truncates. The connector columns stay narrow.

### 2. One shared column header

Every column gets the same two-line header, no wrapping:

```text
DATA SOURCES                          4 · 33 feeds
INTELLIGENCE CORE                     5 families
ACTIVATION                            9 destinations
```

- Eyebrow: mono uppercase 11.5px slate-600, single line (`whitespace-nowrap`).
- Right-side meta: mono 11.5px slate-500 tabular-nums.
- Remove the italic "Every Customer, Every Colleague" caption — it breaks the grammar. Move that phrase, if it should stay, into the section subtitle above the board.

### 3. One shared row shape

All source and destination rows use the same anatomy so the eye reads left-to-right across the board:

```text
[28px tinted icon/bar] Primary name (14px semibold, nowrap, truncate last)
                       Secondary line (12px slate-600)
                       [chip] [chip]                     ● Live
```

- Sources: chips = `N feeds` + `Internal` / `External · Modeled`.
- Destinations: chips = team name + channel (both tinted with the team color instead of only a 3px bar), name at 14px so it stops being the truncated element.
- Status: same `PulseDot` + "Live" label on both sides, right-aligned on the top row.
- Fixed row min-height on both sides (~72px sources, ~56px destinations) with `gap-2`, so left and right columns terminate at the same baseline as the Core panel.

### 4. Tie the Core to its neighbors

- Keep the `#141432` panel and the family hues, but adopt the same header grammar (eyebrow + right-aligned meta) and the same 11.5px caption size as the light columns.
- Reduce family-card saturation one step (`/30` → `/22` surfaces) so the center reads as the focal point without overpowering the columns; keep border and accent-bar hues at full strength.
- Align the first family card's top edge with the first source card's top edge.

### 5. De-cramp the Customer Intelligence Core header

The dark panel's top block (eyebrow, title, count) is squeezed against the panel edges and the first family card:

- Panel padding: `p-4` → `px-6 pt-6 pb-5`.
- Header stack: eyebrow (11.5px mono uppercase slate-300, tracking wider), then the "Customer Intelligence Core" title at `text-xl semibold` with its own line, then the meta count moved to the header's right side aligned to the title baseline instead of crowding the eyebrow row.
- Add `mb-5` breathing room between the header block and the first signal family card; family cards keep their current internal layout (label row + 24h count + ticker) but the gap between cards goes to `space-y-3`.

### 5. Typography scale (applies board-wide)

| Role | Size / weight | Color |
| --- | --- | --- |
| Column eyebrow | 11.5px mono uppercase semibold | slate-600 (light) / slate-300 (dark) |
| Column meta | 11.5px mono tabular | slate-500 / slate-400 |
| Row primary name | 14px semibold | slate-900 / white |
| Row secondary | 12px | slate-600 / slate-300 |
| Chips | 11px medium | tint-700 |

No text below 11px anywhere on the board.

## Technical notes

Single file: `src/components/tepilot/insights/CapabilitiesView.tsx` — the pipeline grid template, `SourceGroupCard`, the destination row renderer, the two light column headers, and the Core panel header/card surfaces. Presentation only; source data, signal data, click-to-open detail behavior, and the ticker animation logic are untouched. Strict light theme outside the Core panel; no `dark:` utilities.

## Verification

Screenshot `/bankdemo` → System at 1440px and confirm: no truncated names in any column, headers on one line, all three columns ending at the same baseline, and clicking a source/signal/destination still opens the detail panel. Build log clean.
