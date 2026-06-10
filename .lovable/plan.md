## Goal

Restyle the **Data Inputs** column of the Capabilities tab as a connection-status dashboard. Each row shows its upstream source system with a green check confirming it's connected.

## Source mapping

| Input | Source |
|---|---|
| Card Transactions | Card Processor |
| ACH & Wires | Core |
| Checks | Core |
| Zelle | EWS |
| Digital Telemetry | Digital Banking |
| Credit Score | Credit Bureau |

## Changes

Single file: `src/components/tepilot/insights/CapabilitiesView.tsx`.

1. Extend `INPUTS` with `source: string`.
2. Replace the simple input pill with a 2-line row:
   - Top line: icon tile + label (sm, semibold).
   - Bottom line (indented under label): green `CheckCircle2` (w-3, emerald-500) + source name (text-[11px] slate-600 font-medium).
3. Update column caption: `● Data Inputs · 6 connected` (small emerald dot prefix + count).
4. Downstream column pills unchanged.

## Out of scope

- No live connection state — purely visual.
- No changes to Core or Downstream, nav, or other tabs.
