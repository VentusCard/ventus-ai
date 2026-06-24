# Fix: Query parser fails when clauses share a line

The DSL parser splits the query by newlines, so `SINCE startOfDay(-30d) UNTIL today` on one line gets parsed as a single SINCE clause with the value `startOfDay(-30d) UNTIL today`, then `parseDate` rejects it.

## Fix

In `src/components/tepilot/insights/query/queryDslEngine.ts`, after the existing line tokenizer, split each line at every occurrence of a top-level keyword so any combination — single-line, multi-line, or AI-generated — parses identically.

Approach: regex-split each line on the boundary `\s+(?=(FROM|SHOW|TIMESERIES|GROUP\s+BY|WHERE|SINCE|UNTIL|COMPARE\s+TO|ORDER\s+BY|LIMIT|VISUALIZE)\b)` (case-insensitive), trim, drop empties, then run the existing clause-by-clause parser. `WITH TOTALS, PERCENT_CHANGE` stays attached to TIMESERIES because `WITH` is not in the split set.

No other files change. After the edit, validate by running the default query (which currently triggers the bug if collapsed to one line) and the existing multi-line default to confirm both work.
