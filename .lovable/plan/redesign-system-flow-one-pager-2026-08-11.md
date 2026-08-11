# Redesign: System Flow (one-pager)

Make the System Flow tab read as a clear, four-band story instead of five even-weight rows of chips, and state explicitly why each band matters to the bank.

## What changes

**1. Collapse the input stage into three buckets**

Today six provider chips (KYC, Transactions, Product Holdings, Digital Banking, Bank Context, External) sit at the same weight. Regroup into three:

```text
  INTERNAL BANK DATA        KYC · Transactions · Product Holdings   (3 providers, ~N inputs)
  DIGITAL ENGAGEMENT        App & web telemetry
  CONTEXT & EXTERNAL        Product catalog, locations, tiers · bureau/off-bank signals
```

Each bucket is one chip; clicking it opens the side panel listing the underlying providers and their inputs (same copy as today, nested one level).

**2. Add an explicit "why it matters" line to every stage**

Each stage gets a one-line outcome statement in bank language, right of the stage title, replacing the current generic captions:

- Inputs — "You already own the data. No new collection, no new consent surface."
- Engine — "Raw strings become resolved, classified, scored behavior — the work no bank wants to build."
- Signals — "One canonical customer picture instead of five team-specific guesses."
- Teams — "Every team acts on the same signal, so the customer sees one bank."
- Destinations — "Lands in the systems your teams already work in — no new console to adopt."

**3. Sharpen hierarchy**

- The engine band becomes the visual anchor: taller, tinted, Ventus mark plus the 5-step strip, with a clear "the only new layer" framing.
- Input and destination bands render lighter (they are the bank's existing estate), signals and teams render as the value bands.
- Connectors get direction (down arrow with a short label: "enriched", "activated") so the read order is unambiguous.

**4. Header**

Keep the single-screen status rail, trim to three metrics (pipeline state, signal layers firing, destinations), and put the thesis line on its own row so it is readable rather than truncated.

Everything stays one screen, no page scroll; detail still opens in the right-hand panel.

## Technical notes

- Only `src/components/tepilot/insights/SystemFlowView.tsx` changes. `CapabilitiesView.tsx` and its exported `SIGNALS` / `TEAMS` / `DESTINATIONS` / `createSourceGroups` stay untouched.
- A local `SOURCE_BUCKETS` map in SystemFlowView groups existing `createSourceGroups()` providers by name into the three buckets; input counts are summed from the real data, no numbers invented.
- Side panel gains a bucket case that renders each member provider as a sub-heading with its input list.
- Strict light theme, existing per-signal/per-team tints, no `dark:` utilities, no new claims or metrics beyond what the demo already shows.
