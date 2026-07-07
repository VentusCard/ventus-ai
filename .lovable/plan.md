## Goal
Replace the disabled "Digital Telemetry — Coming soon" card in the `/demo` popup with an **External Intelligence** card that renders a configurable list of external signals. The current dataset has one signal (car loan renewal in 2 months), but the design must accept any number of future signals (property, marriage, employment change, bureau tradeline updates, VIN registrations, etc.) with zero code changes to the pipeline. Every configured signal must automatically flow into every downstream consumer (Next-Product, Next-Offer, product actions, intel-panel pills, phone view, WM CoPilot).

## Architecture — dynamic signal source

### 1. New module: `src/lib/externalIntelligenceSignals.ts`
Single source of truth for external-intelligence signals.

```ts
export interface ExternalIntelSignal {
  id: string;
  event_name: string;          // becomes LifeEvent.event_name
  confidence: number;          // 0..1
  category: "bureau" | "property" | "auto" | "demographics" | "life_event" | "employment" | "other";
  provider: string;            // e.g. "Bureau Tradeline", "Property Data", "Auto & VIN"
  headline: string;            // popup card row title
  detail: string;              // popup card row sub-line
  evidence: { merchant: string; amount: number; date: string; relevance: string }[];
  talking_points: string[];
  // optional per-customer scoping; empty/undefined => applies to all
  appliesTo?: string[];        // DEMO_CUSTOMERS ids
}

// Signals shipped today
export const EXTERNAL_INTEL_SIGNALS: ExternalIntelSignal[] = [
  {
    id: "auto-loan-renewal",
    event_name: "Car Loan Renewal in ~2 Months",
    confidence: 0.92,
    category: "auto",
    provider: "Bureau Tradeline",
    headline: "Car loan renewal in ~2 months",
    detail: "Bureau tradeline · estimated maturity window · Toyota Financial Services",
    evidence: [{
      merchant: "Toyota Financial Services",
      amount: 485,
      date: "<latest>",
      relevance: "External bureau tradeline — auto loan maturity within 60 days",
    }],
    talking_points: [
      "Refi window opens now — pre-qualify for a lower APR before payoff.",
      "If trading in, pair with a new-auto loan pre-approval.",
      "Free cash flow (~$485/mo) can seed a HYSA or 529 top-up.",
    ],
  },
  // Future signals just get appended here — no other file needs to change.
];

// Helpers
export function getExternalSignalsFor(customerId: string): ExternalIntelSignal[];
export function externalSignalToLifeEvent(s: ExternalIntelSignal): LifeEvent;
```

### 2. `src/components/exec-demo/ExecDemoSelectionDialog.tsx`
- Remove the "Digital Telemetry" dashed card (lines ~537-550).
- Add an active **External Intelligence** card rendered from `getExternalSignalsFor(customer.id)`:
  - Card header (like KYC/Income): badge "External Intelligence" (indigo/violet), then `{N} signal{s} · Bureau + third-party enrichment`.
  - Body: one row per signal — `{headline}` (bold) + `{detail}` (muted) + right-aligned `{provider}` chip.
  - If no signals, hide the card entirely.
  - Collapsible like the other cards, expanded by default.

### 3. `src/pages/ExecDemoPage.tsx` — single injection point
Inside `fireLifeEventDetection` (~line 722), immediately after `events` is fetched and **before** `setDetectedLifeEvents` / `detectedLifeEventsRef.current` are written:

```ts
const external = getExternalSignalsFor(DEMO_CUSTOMERS[selectedIdx].id)
  .map(externalSignalToLifeEvent);

// Interleave: keep the top detected event first, then external signals,
// then remaining detected events. Cap at 3 (matching current .slice(0,3)).
const merged = [events[0], ...external, ...events.slice(1)]
  .filter(Boolean)
  .slice(0, 3);

setDetectedLifeEvents(merged);
detectedLifeEventsRef.current = merged;
```

Pass `merged` (not `events`) into:
- `fireProductCards(merged, personaSynthesisRef.current)` (line 727)
- `fireNextOffers(syn, pillars, merged.length > 0 ? merged : undefined)` (line 733)

For custom-CSV customers where `selectedIdx` doesn't map cleanly, `getExternalSignalsFor` falls back to signals with no `appliesTo` (i.e. universal), so the pipeline still works.

### Downstream flow (already handled, no extra changes)
Because everything reads from the same `detectedLifeEvents` / `detectedLifeEventsRef` / the `events` arg, every added external signal automatically reaches:
- **Next-Product** — `generate-product-cards` (`life_events: events` at line 833)
- **Product Actions** — `generate-product-actions` (`life_events` at line 885)
- **Next-Offer** — `fireNextOffers(..., events)` (line 733)
- **Risk-triggered product regen** — reads `detectedLifeEventsRef.current` (line 787)
- **Intel-panel pills, phone view, WM CoPilot** — read `detectedLifeEvents` state (lines 1416, 1510)

## Adding future signals
A new external signal is added by appending one object to `EXTERNAL_INTEL_SIGNALS`. No changes to the popup, the intel panel, the edge functions, or any downstream component.

## Acceptance
- Popup no longer shows "Digital Telemetry".
- Popup shows the External Intelligence card, rendered from the config module, currently with one signal.
- After running analysis, the car-loan-renewal pill appears (92%) as the second life-event pill.
- Adding a second entry to `EXTERNAL_INTEL_SIGNALS` renders a second popup row AND a second injected pill AND is passed into Next-Product/Next-Offer calls without any other edits.
- Light-theme and pill styling rules preserved.