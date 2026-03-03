

# Horizontal Products Dropdown — 2-Column Layout

## Goal
Redesign the Products dropdown from a single narrow column (340px) into a wider horizontal layout with a clear visual separation between the core technology and the five insight tools.

## Layout

```text
+---------------------||---------------------+---------------------+
| ONE TECH CORE       || FIVE INSIGHT TOOLS                        |
|                     ||                                           |
| [icon] Transaction  || [icon] Bank-Wide    | [icon] Travel       |
|   Enrichment        ||   Analytics         |   Experience        |
|   desc...           ||   desc...           |   desc...           |
|                     ||                     |                     |
|                     || [icon] Consumer     | [icon] Wealth       |
|                     ||   Rewards           |   Management        |
|                     ||   desc...           |   desc...           |
|                     ||                     |                     |
|                     || [icon] Customer     |                     |
|                     ||   Experience        |                     |
|                     ||   desc...           |                     |
+---------------------||---------------------+---------------------+
```

## Changes

### File: `src/components/Navbar.tsx`

**Width**: `w-[340px]` becomes `w-[720px]`

**Positioning**: Change from `left-1/2 -translate-x-1/2` to `left-0` so the wider dropdown anchors left and avoids viewport overflow.

**Structure**: Replace the single-column list with a flex row:
- **Left section** (~240px): "One Tech Core" section label + the Transaction Enrichment card. Separated from the right by a vertical `border-r border-gray-100` divider.
- **Right section** (~480px): "Five Insight Tools" section label spanning both sub-columns, then a `grid grid-cols-2` layout:
  - Column 1: Bank-Wide Analytics, Consumer Rewards, Customer Experience (3 items)
  - Column 2: Travel Experience, Wealth Management (2 items)

**Card styling**: Same icon + title + description pattern, same hover/active-page indicator. Text wraps naturally in narrower columns.

**Mobile menu**: No changes — stays as the existing collapsible accordion.

No other files are modified.
