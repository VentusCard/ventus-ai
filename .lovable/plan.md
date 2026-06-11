# Gate Campaign Builder tab into 3 sequential steps

Tab: **Targeting → Campaign Builder** on `/bankdemo`, rendered by `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`. Today it renders all three sections at once:

1. `ProductPickerSection` — pick product + offers + link
2. `ExclusionFunnelSection` — eligibility funnel
3. `MessagePreviewsSection` — generated message cards

## Change

In `ProductCampaignBuilderView.tsx`:

- Add `const [visibleStep, setVisibleStep] = useState<1 | 2 | 3>(1)`.
- Render section 2 only when `visibleStep >= 2`, section 3 only when `visibleStep >= 3`.
- After section 1 and section 2 (only while they are the current last-visible step), render a right-aligned pill button:
  ```
  <div className="flex justify-end">
    <button ...>Next step →</button>
  </div>
  ```
  Styling matches existing demo pills: `rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 px-3 py-1.5`.
- Step 1's Next is **disabled** until `productName` is non-empty (and visually faded). Step 2's Next is always enabled.
- When the user picks a *different* product via `handleSelectProduct`, reset `visibleStep` to 1 so the gating restarts cleanly.
- No other files touched — `MessagePreviewsSection`, hardcoded Customer-Choice cards, sidebar, header all unchanged.

## Out of scope

- Other tabs / pages.
- Animation/transition (a simple conditional mount is enough).
- Persisting step across tab switches.
