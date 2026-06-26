Keep the existing 3-column layout (Sources · Ventus Core · Destinations). Inside the **Ventus Core card**, split the interior into two side-by-side bands so the 5 Applications live within Core, visually fed by the 5 signals.

```text
Sources  →   ┌─ Ventus Core ───────────────────┐   →   Destinations
             │ 5 Signals  ──fan──▶  5 Apps     │
             └─────────────────────────────────┘
```

## The 5 Applications (new band inside Core)

1. **Analytics & Targeting** — Reports library, AI-assisted SQL Query console, cohort export, segment templates.
2. **Next-Offer** — Personalized deals/rewards matched to lifestyle pillars and recent behavior.
3. **Next-Product** — Lifecycle product recommendations (HELOC, 529, Wealth, Auto, Mortgage, HYSA, Travel Card, SBL, Term Life) triggered by life events + financial posture.
4. **Next-Conversation (Regular)** — Branch and contact-center talking points + outreach pointers for everyday customers.
5. **Next-Conversation (Wealth)** — RM copilot for HNW clients: portfolio context, life-event prep, meeting briefs.

Each is a clickable chip; selecting one toggles an expandable detail panel below the diagram with 4–6 concrete capabilities (same UX as the existing signal panel).

## Visual wiring

- Sources → Core: unchanged (left edge of the Core card).
- Inside Core: a small inline SVG draws faint dashed fan lines from each of the 5 signal chips (left band) to each of the 5 application chips (right band), making it visually obvious that all signals feed all applications.
- Core → Destinations: continues from the right edge of the Core card to the 7 destinations.

## Technical implementation

In `src/components/tepilot/insights/CapabilitiesView.tsx`:

1. Add `ApplicationDetail` type + `APPLICATIONS` constant (5 entries; violet/teal/amber/rose/indigo accents to distinguish from signal tints).
2. Widen the Core grid column (e.g. `grid-cols-[240px_minmax(440px,1fr)_240px]`) and restructure the Core card's interior:
   - Keep the existing header (logo, "Behavioral Intelligence Core", "Classifies · Enriches · Scores · Distributes").
   - Below the header, introduce a 2-column inner grid: left column = "Signals" (existing 5 chips), right column = "Applications" (5 new chips).
   - Section labels above each column: "Signal families · click to inspect" and "Applications · click to inspect".
3. Add a small inline SVG overlay positioned absolutely over the inner 2-column grid that draws `5 × 5 = 25` dashed fan lines (same gradient/animation style as `NetworkWires`) from each signal row's right edge to each application row's left edge.
4. Add `activeApplicationLabel` state; selecting an application clears `activeSignalLabel` (and vice versa) so only one detail panel renders at a time. Render a shared `activeDetail` panel below the network with the existing layout (icon, title, count badge, description, 2-col items grid).
5. Leave the outer `NetworkWires` (Sources→Core, Core→Destinations) unchanged.
6. Update the `howItWorks` subtitle to mention applications.

No changes to sources, signal definitions, destinations, Products tab, or other tabs. Strict light theme preserved.
