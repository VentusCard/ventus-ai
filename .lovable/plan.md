Group the **Sources** column in `CapabilitiesView.tsx` by provider, with each group rendered as an expandable card (click to expand in place; collapsed by default except possibly the first).

Groupings:

1. **Core Banking — FIS** → KYC & Profile, ACH & Wires, Deposits & Statements
2. **Card Processor — Fiserv** → Card Transactions
3. **Payments Network — EWS** → Zelle
4. **Digital Banking** → Digital Telemetry
5. **Credit Bureau — Experian / TransUnion** → Credit Bureau (FCRA), Wealth Data *(non-FCRA)*, Property Data *(non-FCRA)*, Demographics Data *(non-FCRA)*
   - The three marketing inputs carry an inline "non-FCRA" badge; the bureau credit file itself is unlabeled (FCRA-regulated by default).

UI behavior:
- Each group is one card showing provider name, input count, and a chevron.
- Click toggles expansion in place; multiple groups can be open at once.
- SVG connectors terminate at the group card (one wire per group), preserving a clean diagram.

No changes to Core or Destinations columns.