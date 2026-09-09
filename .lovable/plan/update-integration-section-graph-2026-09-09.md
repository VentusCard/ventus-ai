# Update Integration Section Graph

## Goal
Redesign the source/destination graph in the homepage Integration section so core service providers collapse into a single ticker card, external intelligence appears as a source, and the destinations reflect Ventus output surfaces.

## Current state
`src/components/IntegrationSection.tsx` renders a three-column diagram:
- **Sources:** FIS, Fiserv, Jack Henry SilverLake, Databricks, Snowflake (5 individual cards)
- **Engine:** Ventus card in the center
- **Destinations:** Salesforce Financial Cloud, Rewards Engine, Digital Banking App (3 cards)

SVG dashed connectors animate from each source into the engine and from the engine to each destination.

## Proposed changes

### 1. Sources column
- **Core Service Providers** — one combined card with a smooth horizontal ticker that cycles through the FIS, Fiserv, and Jack Henry logos/names. The ticker loops continuously and pauses briefly on each provider.
- **Data Warehouse** — keep Databricks and Snowflake as one combined card (or two cards if layout demands). They are not "core service providers," so they remain separate from the ticker.
- **External Intelligence** — new source card added below the data warehouse card. Use a generic external-data icon or a small constellation of signal icons (credit, property, auto, demographic) to represent bureau and third-party enrichment.

### 2. Destinations column
Add three new destination cards while preserving the existing ones unless the layout becomes too crowded:
- **Ventus AI Database** — labeled destination card with a database/storage icon.
- **Marketing Automation** — labeled card representing outbound campaign orchestration.
- **AI Coworker** — labeled card, clickable, linking to `/coworker`.

If six destination cards make the column too tall, the plan will stack them in a 2×3 grid inside the destinations column on desktop, or switch to a single column on smaller screens.

### 3. Connectors and layout
- Update SVG connector math so it still originates from each source card and terminates at each destination card after the card count changes.
- Keep the center Ventus engine card and the glowing pulse animation.
- Preserve the glassmorphic card style and responsive behavior (single column on mobile, three-column diagram on desktop).

### 4. Visual polish
- Ticker uses CSS transform animation with duplicated items for seamless looping.
- All new destination cards use the existing `TileBox` style or a close variant.
- The AI Coworker card uses a `<Link>` from react-router-dom and a subtle hover state.

## Files to change
- `src/components/IntegrationSection.tsx` — main diagram updates.
- `src/styles/components.css` or inline styles — ticker keyframes (reused pattern, no new dependencies).

## Out of scope
- No backend changes.
- No new image assets unless existing partner logos can be reused.
- No changes to the Integration section copy above the graph.
