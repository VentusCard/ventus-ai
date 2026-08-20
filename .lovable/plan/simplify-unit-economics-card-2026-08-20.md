# Simplify Unit Economics Card

## Problem
The Unit Economics card in the three personalization tabs currently over-explains the math with verbose formulas, driver counts, and a cluttered assumptions panel. The user wants a much tighter view focused on two key per-customer-per-year numbers.

## Goal
Reduce the card to a clean, scannable summary: **one headline value and one bank-take/value metric per surface**, all expressed per average customer per year.

## Changes

### 1. Simplify the economics model (`src/lib/personalizationUnitEconomics.ts`)
- Keep `computeSurfaceEconomics` but make each surface return exactly **2 lines**:
  - **Deals**: "Total deals spend / user / yr" and "Bank take / user / yr"
  - **Product**: "Recommended products" (count) and "CAC avoided / user / yr"
  - **Relationship**: "Attrition reduction" and "Retention cost saved / user / yr"
- Remove verbose formulas; use short labels only.
- Keep editable assumptions in state but do not expose them as formula text.

### 2. Redesign the card UI (`src/components/tepilot/insights/personalization/UnitEconomicsCard.tsx`)
- Remove the "This surface — X" header block and the driver-count subtext.
- Show the current surface's two metrics as a simple stacked row with large values.
- Keep a collapsed "Assumptions" section (single click to expand) so the math remains adjustable without dominating the card.
- Keep the running total, but present it as a single line: "Total value / customer / yr" with per-surface chips only on hover or in a compact list.

### 3. Verify consistency
- Ensure all three personalization tabs (Deals, Product, Relationship) use the same simplified card.
- Confirm per-customer-per-year framing is consistent across surfaces.
- Validate that changing assumptions still clears stale contributions and recalculates correctly.
