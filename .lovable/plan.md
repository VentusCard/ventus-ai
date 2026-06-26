Add three new entries to the **Sources** column in `src/components/tepilot/insights/CapabilitiesView.tsx`, all attributed to credit bureau providers (e.g., Experian/Equifax/TransUnion) and clearly marked as non-FCRA marketing data:

1. **Wealth Data (non-FCRA)** — Estimated investable assets, net worth tier, affluence index. Provider: Credit Bureau (non-FCRA).
2. **Property Data (non-FCRA)** — Homeownership status, estimated home value, mortgage age, property type. Provider: Credit Bureau (non-FCRA).
3. **Demographics Data (non-FCRA)** — Age band, household composition, income estimate, life stage. Provider: Credit Bureau (non-FCRA).

These will appear as additional source nodes in the left column, wired into the central Ventus Core via the existing animated SVG connectors. Each will use the same card styling as existing sources and include a small "non-FCRA" badge to clarify marketing-only usage (cannot be used for credit decisions).

No changes to the Core or Destinations columns.