

## Plan: Redesign Customer Experience Preview as Single-Column Holistic Layout

**What changed from before**: Remove the 2-column split. Present everything in one flowing column.

### New Layout (single column, top to bottom)

1. **Category → Pillar Consolidation** (primary focus): Show the raw categories mapping into lifestyle pillars with budget progress bars — same data, but laid out as a full-width vertical list instead of cramped in half the space.

2. **Gamification card** (minor): The "Dining Streak" achievement — keep as-is, just full width.

3. **AI Coaching card** (minor): The "Wellness spending up 28%" insight — keep as-is, just full width.

**Removed**: The right-column "Bank App Experience" with the duplicated 2×2 spending grid. The consolidation view already shows spend/budget per pillar, so the grid was redundant.

### Changes

**File: `src/components/PlatformTabs.tsx`** (lines 207-307)
- Replace `grid grid-cols-2` with single `space-y-3` container
- Category→Pillar cards become full-width with more room for the category chips, arrow, and pillar label
- Gamification and Coaching cards stay but move below the pillar list
- Remove the "Bank App Experience" right column entirely

