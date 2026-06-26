## Restructure Sources column in System tab

In `src/components/tepilot/insights/CapabilitiesView.tsx`:

1. **Flatten provider groups back into individual source items.** Replace the current `SOURCE_GROUPS` (Core Banking, Card Processor, Payments Network, Digital Banking, Credit Bureau) with a flat list of individual inputs, each rendered as its own small card showing icon + label + provider sublabel + non-FCRA badge where applicable. No expand/collapse — just a clean vertical list.

2. **Keep "Bank Product" as a distinct, visually differentiated section** at the top (or bottom) of the Sources column:
   - Wrapper with a different visual treatment (e.g. subtle tinted background, dashed or accent border, "Internal" tag) to set it apart from the external data feeds.
   - Still expandable in place to reveal the 9 product categories.
   - Retains the "Open Products tab" CTA.

3. **Section headers** above the two zones: e.g. "Internal catalog" for Bank Product, "External data feeds" for the individual source items.

4. **Update `NetworkWires`** so wire anchors target each individual source row plus the Bank Product card (instead of grouped cards).

5. Keep header count text accurate ("1 internal catalog · N external feeds → Core → M destinations").

No changes to Core, Destinations, signal chips, or detail panel.