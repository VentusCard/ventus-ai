Redesign the bullet-point capability lists (the `items` arrays under each team in the Systems tab) into a grid of feature cards, each with a Lucide icon, bold title, and description.

### What we change

1. **Data model** — Add an `icon` (Lucide component reference) to every capability item in the `TEAMS[].items` arrays across all 5 teams:
   - Analytics & Targeting
   - Merchant Deals
   - Product Growth
   - Wealth Management
   - Risk & Compliance

2. **Render style** — Replace the existing 2-column dot-bullet grid with a responsive card grid:
   - Each card shows a left-aligned icon inside a small colored badge (matching the team tint), the capability label in semibold, and the sublabel in muted text.
   - Cards sit on a white background with a subtle border, matching the existing enterprise aesthetic.
   - Responsive: 1 column on mobile, 2 columns on tablet, 3 columns on desktop.

3. **No other page changes** — The workflow strip above stays exactly as-is. Only the bullets below the workflow are redesigned.

### Files touched
- `src/components/tepilot/insights/CapabilitiesView.tsx` only.

### Visual approach
- Clean, enterprise-light cards consistent with the existing dot/border palette.
- Each team's cards inherit that team's accent tint for the icon badge background.
- No animations added; keep the same fade-in/slide-in that already exists for the detail panel.