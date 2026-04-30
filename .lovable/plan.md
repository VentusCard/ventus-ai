## Goal

Redesign the 12-pillar color palette so each pillar is visually distinct and **no pillar uses red** (red is reserved for Risk pills). Today, Healthcare is red, Entertainment leans pink-red, and Pets / Pets & Care / Style & Beauty all share the same pink — creating confusion.

## New palette

| Pillar (AI + MCC alias) | Hue | Dot hex |
|---|---|---|
| Travel & Exploration / Travel & Transport | Blue | `#3b82f6` |
| Food & Dining | Amber | `#f59e0b` |
| Health & Wellness / Wellness & Fitness | Emerald | `#10b981` |
| Sports & Active Living / Sports & Active | Green | `#22c55e` |
| Shopping | Violet | `#8b5cf6` |
| Entertainment & Culture / Entertainment | Fuchsia | `#d946ef` |
| Home & Living | Teal | `#14b8a6` |
| Family & Community / Education & Family | Indigo | `#6366f1` |
| Healthcare | Cyan (was red) | `#06b6d4` |
| Technology & Digital Life / Technology | Deep sky | `#0284c7` |
| Pets / Pets & Care | Pink | `#ec4899` |
| Style & Beauty | Lime (was pink) | `#84cc16` |
| Financial & Aspirational / Financial Planning | Yellow | `#eab308` |
| Miscellaneous | Slate | `#94a3b8` |

Key disambiguations:
- Healthcare moves off red → **cyan**.
- Style & Beauty moves off pink (was identical to Pets) → **lime**.
- Travel vs Technology now use clearly different blue values (mid blue vs deep sky).
- Health & Wellness (emerald) vs Sports & Active (green) — kept both green-family but distinct values.

## Changes

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx`, lines 84–111 (`PILLAR_COLORS` map):

Update each pillar entry's `bg` (rgba @ .12), `border` (rgba @ .35), `text` (deep tone for accessibility), and `dot` (the bright accent) to the new palette above. Keep both the MCC fallback names and the AI classifier names in sync (mirror entries so identical pillars resolve to the same color regardless of source).

No other files change. No structural/logic change — only the color values inside `PILLAR_COLORS`.
