# Move System KPI cards into Intelligence Database

Relocate the four KPI tiles (Customers Profile Enriched, Enrichment coverage, External signals Ingested 24h, Activations routed 24h) from the System tab into the Intelligence Database tab, rendered in a more compact single-row strip.

## Changes

**New `dashboard/IntelligenceKpiStrip.tsx`**
- Compact 4-up strip (grid of 4 on desktop, 2 on small screens) in a single bordered white card row.
- Each tile: pulsing colored dot + label (11px uppercase-ish slate label), value at ~18px semibold tabular-nums, one short foot line (delta or caption) at 10.5px mono.
- Keeps the same values and deltas as the System tab today; the external-signals value uses the same derived detection total so the number stays identical.
- No sparklines — that is the main density saving.

**`dashboard/AnalystDashboardView.tsx`**
- Render the new strip directly under the page header (above the Ventus priority sliver).

**`CapabilitiesView.tsx`**
- Remove the KPI strip block and the now-unused `Kpi` component (and `Sparkline` if nothing else uses it). The System tab starts at the "Intelligence pipeline" section.
- Keep the detection-total computation, since it is still used by the pipeline board.

No data/logic changes — presentation only.
