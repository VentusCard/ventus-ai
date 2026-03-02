

## Replace "See the engine in action" demo on /enrichment

### What changes
Replace the current `EnrichmentInteractiveDemo` component (vertical pipeline with 6 agent cards + transaction feed) with the `VentusTransactionEnrichment` component (horizontal table showing raw-to-enriched columns with rolling transactions and a persona/signals panel below).

### Steps

1. **Update `src/pages/Enrichment.tsx`**
   - Replace the import of `EnrichmentInteractiveDemo` with `VentusTransactionEnrichment` from `src/components/technology/demos/VentusTransactionEnrichment.tsx`
   - Swap `<EnrichmentInteractiveDemo />` for `<VentusTransactionEnrichment />` in the "How It Works" section (line 117)

2. **No new files needed** — the `VentusTransactionEnrichment` component already exists in the codebase at `src/components/technology/demos/VentusTransactionEnrichment.tsx`. The uploaded file matches this existing component.

### Technical notes
- The existing `VentusTransactionEnrichment` component uses direct DOM manipulation (createElement, innerHTML) rather than React state, with its own embedded `<style>` block
- It includes a responsive scale wrapper that shrinks on tablet (0.7x) and mobile (0.5x) to fit the wide table layout
- The `EnrichmentInteractiveDemo` component and its import can be left in place (unused) or cleaned up — no functional impact either way

