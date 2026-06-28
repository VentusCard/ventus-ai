In the System tab (`/bankdemo`), the Ventus Core card currently shows two inner bands: **Signals** (left) and **Applications** (right). Restructure the right-hand band to display teams instead of applications.

### 1. Rebuild the right-hand column entries
Keep the first entry as-is and replace the remaining four with the requested team names:

- **Analytics & Targeting** (kept)
- **Merchant Deals** (new)
- **Product Growth** (new)
- **Wealth Management** (new)
- **Risk & Compliance** (new)

Each entry needs:
- A concise label and short label (for the chip button)
- A distinct color class, tint class, and dot color
- A team-oriented description paragraph
- A list of 4–5 team responsibility items (label + sublabel)

### 2. Detail-panel content rewrite
For every team, replace the current capability bullets with concrete team responsibilities. Examples:
- **Merchant Deals**: sourcing merchant partners, deal rate negotiation, offer catalog maintenance, seasonal campaign alignment, redemption tracking.
- **Product Growth**: product adoption funnels, cross-sell pipeline health, campaign performance review, segment-size validation, go-to-market briefs.
- **Wealth Management**: high-net-worth client segmentation, advisor briefing workflows, portfolio-context notes, life-event timing, meeting-prep distribution.
- **Risk & Compliance**: alert triage SLAs, model governance reviews, SAR escalations, policy threshold tuning, audit trail maintenance.
- **Analytics & Targeting**: can keep its existing bullets or be lightly reframed as a shared services team.

### 3. UI copy updates
Update the band header label from `Applications · what we activate` to `Teams · who we serve`.
Update the detail panel kind label from `Application` to `Team`.
Update the badge suffix from `capabilities` to `responsibilities`.

### 4. Visual consistency
- Keep the amber-toned background gradient on the right band so it still reads as "activation/output".
- Assign each team a distinct icon and color chip so the 5 rows are visually distinguishable.
- Keep the manifold bus connector wiring as-is (5 outbound stubs).

### Files touched
- `src/components/tepilot/insights/CapabilitiesView.tsx` — constants, headers, detail rendering, and subtitle/howItWorks copy in `TabHeader`.