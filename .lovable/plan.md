

# Glassmorphism Stacked Cards — Vertical Offset Only

## Summary
Redesign the Demographics and Transactions input boxes in Beat 5 as glassmorphism stacked cards. Each box gets 2 "ghost" cards behind it, offset **vertically only** (no horizontal shift).

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx` (lines 398-420)

Replace each flat input box with a `relative` wrapper containing:
- **2 ghost cards** (absolute positioned behind), using:
  - Card 1: `transform: translateY(-8px) scale(0.97)`, opacity 0.5
  - Card 2: `transform: translateY(-16px) scale(0.94)`, opacity 0.3
  - No `translateX` — purely vertical stacking
- **Front card**: `backdrop-filter: blur(16px)`, semi-transparent white bg (`rgba(255,255,255,0.7)`), subtle border (`rgba(255,255,255,0.4)`), soft shadow, `position: relative; z-index: 2`
- Ghost cards share the glass style but more transparent

Phase transitions remain the same — neutral glass in phase 0, blue-tinted in phase 1.

