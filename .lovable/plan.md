# Add horizontal padding to /demo intelligence panel and enrichment table

The Behavioral Intelligence section and the Semantic Enrichment transaction table currently sit flush against the left and right viewport edges in the full-width enrichment view (when no tab is selected after synthesis). Add consistent horizontal breathing room.

## Change

### `src/components/exec-demo/ExecDemoIntelPanel.tsx` (line 355)

Update the root container's `fullWidthEnrichment` padding:
- From: `pt-2 pb-1 px-0`
- To: `pt-2 pb-1 px-6`

This single change adds ~24px of horizontal padding on both sides for both the Behavioral Intelligence header/pills section AND the enrichment table beneath it (since both render inside this container in full-width mode). The redundant `px-5` on the header row (line 704) can stay — it will just nest harmlessly within the new outer padding, but does not need removal.

The non-full-width branch (when a tab is selected) already has `px-5` and is unchanged.
