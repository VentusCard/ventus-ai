

# Add Consumer Benefit Blocks to Integration Architecture Diagram

## What's changing
Replace the single "Customers" bar at the bottom with a new layout that includes:
1. A row of 4 colored consumer benefit blocks: **"Next Gen UX"**, **"Lifestyle Budgeting"**, **"Personalized Rewards"**, **"Relationship Intelligence"**
2. An overall bracket/container around all 4 labeled **"Personalized Banking Experience"**
3. Per-pillar color coding for the benefit blocks and Ventus pillars
4. The existing "Customers" bar moves below the benefit blocks

## Visual structure (top to bottom)
```text
BANK PARTNER DATABASE
        |
    VENTUS AI HUB
   /      |       \
[Enrichment] [Rewards] [Wealth]   <-- pillar pairs (existing + Ventus)
   \      |       /
+----- Personalized Banking Experience -----+
| Next Gen UX | Lifestyle | Personalized | Relationship |
|             | Budgeting | Rewards      | Intelligence |
+-----------------------------------------------+
        |
    CUSTOMERS
```

## Technical changes in `src/components/technology/IntegrationArchitectureDialog.tsx`

### 1. Add per-pillar accent colors
Add a color map to the PAIRS data:
- **Enrichment**: Indigo accent (`hsl(255 70% ...)`)
- **Rewards**: Emerald accent (`hsl(160 60% ...)`)
- **Wealth**: Amber accent (`hsl(35 85% ...)`)

Use these for the Ventus pillar fill, stroke, and text colors instead of uniform blue.

### 2. Add consumer benefit blocks
Define a `BENEFITS` array with 4 items:
- "Next Gen UX" (blue accent)
- "Lifestyle Budgeting" (indigo accent, tied to Enrichment)
- "Personalized Rewards" (emerald accent, tied to Rewards)
- "Relationship Intelligence" (amber accent, tied to Wealth)

Render these as 4 evenly-spaced rounded pill/card shapes in a row below the pillar pairs.

### 3. Add "Personalized Banking Experience" bracket
Draw a dashed rounded rect around all 4 benefit blocks with a label centered above or on the border, acting as a grouping container.

### 4. Adjust layout constants
- Add a `BENEFITS_ROW_Y` constant positioned below the pillars (approx `PILLAR_TOP + maxPillarH + 40`)
- Move `customersY` further down to accommodate the new row (approx `BENEFITS_ROW_Y + 80`)
- Increase `svgHeight` accordingly

### 5. Add connection lines
- Dashed lines from each pillar pair down to its corresponding benefit block
- Dashed lines from the benefit bracket down to the Customers bar

### 6. Formatting cleanup
- Add subtle gradient defs for the Bank Partner Database and Ventus AI Hub boxes
- Use pillar accent colors on the grouping bracket strokes when active

### File changed
- `src/components/technology/IntegrationArchitectureDialog.tsx`

