

## Plan: Convert Demo Page to Light Theme

The demo page and all its sub-components currently use a dark theme (dark navy backgrounds `#0a0f1e`, `rgba(15, 23, 42, ...)`, white text, `slate-700/800` borders). This plan converts everything to a light, enterprise-grade theme consistent with the rest of the site.

### Files to Edit (7 files)

**1. `src/pages/DemoPage.tsx`**
- Change root background from `#0a0f1e` to `#ffffff`
- Left panel: white/light gray background, light border instead of `border-slate-800`

**2. `src/components/demo/DemoCustomerPanel.tsx`**
- Title text: dark (`text-slate-900`) instead of `text-white`
- Subtitle: `text-slate-500` instead of `text-slate-400`
- Select dropdown: white bg, dark text, light border
- Profile card: white bg, light border, dark text for names/values
- Pillar chips: light gray bg instead of `bg-slate-800`
- Divider: light border color

**3. `src/components/demo/DemoNetworkDiagram.tsx`**
- Engine node center box: white bg, light border, dark text
- Transaction cards (TxCard): white bg, light border, dark text
- Output node buttons: white bg, light border, dark text labels
- SVG line gradients: keep colors but adjust opacity for light bg
- Feature list text: `text-slate-500` instead of `text-slate-400`

**4. `src/components/demo/DemoDetailOverlay.tsx`**
- Overlay background: white (`rgba(255,255,255,0.97)`) instead of dark
- Header border: light gray
- Title/text: dark colors
- Close button: dark icon, light hover bg

**5. `src/components/demo/DemoAnalyticsView.tsx`**
- Metric cards: white bg, light border, dark text
- Progress bars: light gray track instead of `bg-slate-800`
- Pillar chips: light gray bg, dark text

**6. `src/components/demo/DemoRewardsView.tsx`**
- Deal cards: white bg, light border, dark text
- Match bar track: light gray
- "Why these deals" box: light tinted bg

**7. `src/components/demo/DemoEngagementView.tsx`**
- Phone frame: light gray border, white bg
- Browser bar: light gray
- App content: white bg, dark text
- Deal rows & spending grid: light gray bg/border

**8. `src/components/demo/DemoWealthView.tsx`**
- Event cards: white bg, light border, dark text
- Confidence bar track: light gray
- Evidence box: light blue tint
- Client profile box: light tinted bg

**9. `src/components/demo/DemoTravelView.tsx`**
- Trip cards: white bg, light border, dark text
- Highlight chips: light gray bg
- Travel affinity/deals: light tinted bg, dark text

### Design Approach
- White backgrounds (`#ffffff` or `#f8fafc`)
- Dark text (`#0F172A` / `text-slate-900`)
- Light borders (`#E2E8F0` / `border-slate-200`)
- Keep accent colors (blue, green, purple, etc.) unchanged
- Consistent with the site's enterprise light theme

