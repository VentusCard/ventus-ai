# Three-column layout for the Personalization tabs

Rework the shared workspace on Personalized Deals, Personalized Product, and Personalized Relationship (/bankdemo) from a 1/3 + 2/3 split into three equal thirds.

## Layout

```text
+------------------+------------------+------------------+
| Customer         | Personalized     | Key features     |
| Selection        | surface          | (this tab)       |
|                  |                  |                  |
| search           |  [ phone mockup ]+------------------+
| signals          |                  | (reserved)       |
|                  |                  | empty placeholder|
+------------------+------------------+------------------+
```

- **Left third** — unchanged Customer Selection card (search + detected signals).
- **Middle third** — the personalized surface card with the phone mockup, now sized to a one-third column. Header, generating badge, empty state, and failure notice stay as they are.
- **Right third** — a new column split vertically into two stacked cards of roughly equal height:
  - **Top: "Key features"** — a short list of what this tab does, specific per surface:
    - Deals: seasonal spend curves, persona affinity ranking, offer generated from live signals, redemption-ready in the wallet surface.
    - Product: next-best-product fit against the catalog, evidence-grounded rationale, channel routing, eligibility guardrails.
    - Relationship: assistant grounded in the customer's own signals, proactive nudges, escalation to a banker, protection/wellness cues.
  - **Bottom: reserved** — an empty bordered card with a light placeholder line ("Reserved for upcoming module"), nothing interactive.

Both right-hand cards render regardless of selection so the column never collapses; the key-features copy is static per tab.

## Technical notes

- `src/components/tepilot/insights/CustomerMockupPanel.tsx`: outer grid `lg:grid-cols-3` stays, but the surface card drops `lg:col-span-2` to one column and a new third column is added. Keep `h-[calc(100vh-140px)] min-h-[720px]` and `min-h-0` flex chains so nothing overflows.
- New component `src/components/tepilot/insights/personalization/SurfaceFeaturePanel.tsx` holding the per-surface feature copy map, keyed by the existing `Surface` type (`rewards | product | relationship`), plus the reserved placeholder card.
- Phone mockup keeps `max-w-[400px]` but will now be constrained by the narrower column; it scales down with its container.
- Strict light theme, slate-200 borders, Manrope. No data, generation, or store changes.
