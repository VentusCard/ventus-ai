# Redesign System tab as a network diagram

Reframe `src/components/tepilot/insights/CapabilitiesView.tsx` (the **System** tab under `/bankdemo`) from the current 3-column "Inputs → Core → Downstream" pill stack into a true **network diagram** with animated wires, similar in spirit to `IntegrationSection.tsx` on the marketing site but denser and enterprise-styled.

## Layout

Single full-width canvas (`bg-white border-slate-200 rounded-xl p-6 lg:p-8`), three vertical columns connected by animated SVG paths:

```text
   SOURCES              VENTUS CORE              DESTINATIONS
 ┌──────────┐                                    ┌──────────────┐
 │ Core     │──┐                              ┌──│ CRM          │
 │ (FIS)    │  │                              │  │ (Salesforce) │
 ├──────────┤  │     ┌───────────────────┐    │  ├──────────────┤
 │ Card     │  │     │  ┌─────────────┐  │    │  │ Rewards      │
 │ Processor│──┼────▶│  │ Behavioral  │  │────┼──│ Provider     │
 ├──────────┤  │     │  │ Intelligence│  │    │  ├──────────────┤
 │ ACH/Wires│──┤     │  │   Core      │  │    ├──│ Digital      │
 ├──────────┤  │     │  └─────────────┘  │    │  │ Banking App  │
 │ Zelle    │──┤     │  5 signal chips   │    │  ├──────────────┤
 ├──────────┤  │     └───────────────────┘    ├──│ Marketing    │
 │ Digital  │──┤                              │  │ Automation   │
 │ Telemetry│  │                              │  ├──────────────┤
 ├──────────┤  │                              ├──│ Advisor      │
 │ Credit   │──┘                              │  │ Console      │
 │ Bureau   │                                 │  ├──────────────┤
 └──────────┘                                 └──│ Risk Ops     │
                                                 └──────────────┘
```

### Node styling

- **Source nodes** (left): white card, `border-slate-200`, small category icon in a tinted square, two lines — bold label (e.g. "Card Transactions") and `text-[11px] text-slate-500` source pill (e.g. "FIS · Card Processor"). Pulsing green dot in the corner = live feed.
- **Ventus Core** (center): keep the existing dark `from-blue-900 to-indigo-900` panel with the Ventus mark and the 5 signal-family chips (Life Event, Behavioral, Financial, Demographic, Risk). Slightly wider than today; chips stack vertically.
- **Destination nodes** (right): same card chrome as sources but with an indigo-tinted icon square and a small "Powered by Ventus" `text-[10px]` line under the label. Examples:
  - CRM — *Salesforce Financial Services Cloud*
  - Rewards Provider — *Augeo / FIS Premium Payback*
  - Digital Banking App — *Mobile + Web*
  - Marketing Automation — *Marketing Cloud / Braze*
  - Advisor Console — *Merrill Workstation-style*
  - Risk Ops — *Actimize / SAS*

### Wires (the network feel)

Single absolutely-positioned SVG layered behind the cards, `preserveAspectRatio="none"`, `viewBox="0 0 100 100"`.

- One curved path per source → core anchor (left side of core, y=50).
- One curved path per core → destination (right side of core, y=50).
- Stroke: `#6366f1` (indigo-500) at `strokeWidth=0.6`, `strokeDasharray="1.2 1.6"`, `vectorEffect="non-scaling-stroke"`, opacity 0.7.
- `<animate attributeName="stroke-dashoffset" from="0" to="-6" dur="2.4s" repeatCount="indefinite" />` so packets visibly flow toward the core, then out to destinations.
- Stagger animation `begin` per line (0s, 0.2s, 0.4s, …) so the flow doesn't pulse in lockstep.
- Small filled circles at every wire endpoint on the core for a "port" look.

### Column headers

Above each column: tiny uppercase eyebrow + count, matching the current style:
- `BANK-NATIVE SOURCES · 7 connected` (green pulse dot)
- `VENTUS AI SYSTEM`
- `ACTIVATION DESTINATIONS · 6 wired` (indigo pulse dot)

### TabHeader

Keep `TabHeader` with the existing icon, but update copy:
- **title**: "System" *(unchanged)*
- **subtitle**: "Network view: how bank-native sources flow through Ventus and back out to activation systems"
- **howItWorks**: rewrite to describe the wiring (sources → core enrichment → destinations).
- **whyItMatters**: unchanged intent — one enrichment layer fans out to every channel of record.

## Data changes

Inside `CapabilitiesView.tsx` only:

- Replace `INPUTS` with a `SOURCES` array of `{ label, sublabel, icon, system }` covering: Core (FIS), Card Processor (Fiserv), ACH/Wires (Core), Zelle (EWS), Digital Banking Telemetry, Credit Bureau, KYC.
- Keep `SIGNALS` as is.
- Replace `DOWNSTREAM` with a `DESTINATIONS` array of `{ label, sublabel, icon }`: CRM (Salesforce FSC), Rewards Provider (Augeo), Digital Banking App, Marketing Automation, Advisor Console, Risk Ops.
- Delete the old `Brace` and `CoreConnectors` helpers; replace with a single `<NetworkWires />` SVG component that takes counts on each side and renders the dashed-flow paths.

## Out of scope

- No changes to other tabs, no new files, no edge functions, no data wiring. Pure visual refactor of `CapabilitiesView.tsx`.
- Strict light theme preserved (core panel stays dark as today — that's the established Ventus mark treatment, matches existing memory).
- No `dark:` utilities, Manrope only.

## Technical notes

- Use CSS grid `grid-cols-[260px_1fr_260px]` with `relative` wrapper; the SVG is `absolute inset-0` behind cards (`z-0`), cards `relative z-10`.
- Wire endpoints computed from column `(i + 0.5) / count * 100` for y, x fixed at ~18 (sources right edge), 38 (core left), 62 (core right), 82 (destinations left edge) in the 0–100 viewBox.
- All animation via inline `<animate>` SVG elements, no JS, no extra deps.
