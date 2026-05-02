## Issue

Pillar pills in the /demo enrichment table are now clickable, but clicking them doesn't visibly filter/sort the rows. Root cause: `ExecDemoIntelPanel` gates the highlight props behind `synthesisTriggered`:

```
highlightedIndices={synthesisTriggered ? highlightedIndices : null}
activePillLabel={synthesisTriggered ? activePillLabel : null}
```

So before persona synthesis runs, the table receives `null` and never highlights — the user sees no effect when clicking pillars in the initial enrichment view.

Additionally, `filteredIndices` in `ExecDemoPage` reads from `execProfile.persona.signalMap`, which uses MCC-fallback enrichment until AI classification arrives. That should already be populated, so indices should be available. The only blocker is the synthesis gate.

## Fix

### `src/components/exec-demo/ExecDemoIntelPanel.tsx`
Remove the `synthesisTriggered` gate on the enrichment table's highlight props so pillar-click filtering works at all phases:

```diff
- highlightedIndices={synthesisTriggered ? highlightedIndices : null}
+ highlightedIndices={highlightedIndices}
- activePillLabel={synthesisTriggered ? activePillLabel : null}
+ activePillLabel={activePillLabel}
```

The synthesis-triggered pill bar (life events, rollups, risk) lives elsewhere and isn't affected — only direct pillar-pill clicks on table rows now produce highlights, which is the intended UX.

### No other files
`handleEnrichmentPillarClick` and `onPillarClick` plumbing are already correct.
