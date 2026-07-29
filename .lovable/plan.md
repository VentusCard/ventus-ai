# Add Segment of One Campaigns to Bank-Facing Solutions

## Goal
Surface the `/bankdemo` Campaign Studio capability as a new bank-facing solution card in the Solutions dropdown, with its own dedicated marketing page that reuses the existing campaign-builder demo.

## What we will build

### 1. Navigation card
Add a third card under **BANK-FACING INTELLIGENCE** in the Solutions dropdown (desktop + mobile):
- **Title:** Segment of One Campaigns
- **Desc:** Build micro-segment campaigns from life events, behavior, and financial signals.
- **Icon:** Megaphone or Target
- **Route:** `/solutions/campaign-intelligence`

### 2. New solution page
Create `src/pages/solutions/CampaignIntelligencePage.tsx` following the same structure as `PortfolioIntelligencePage.tsx`:
- Hero section with eyebrow, headline, subtext, and CTA
- Live demo section reusing `CampaignStudio` from `/bankdemo` (the ground-truth builder)
- 3-step flow: Enrich → Segment → Activate
- 3 stats, e.g. "Micro-segments", "Auto-generated briefs", "<200ms"
- `SolutionsCTA` footer
- SEO component with title/description

### 3. Routing
Add a lazy route in `src/App.tsx`:
- `/solutions/campaign-intelligence` → `CampaignIntelligencePage`
- Optional alias `/solutions/campaigns` for discoverability

### 4. Styling / constraints
- Strict light theme (white bg, slate borders), consistent with other solution pages
- No dark-mode utilities
- Use Manrope/Inter typography already in use

## Files to change
- `src/components/Navbar.tsx` — add the new card to `analyticsItems`
- `src/pages/solutions/CampaignIntelligencePage.tsx` — new page
- `src/App.tsx` — add route

## Open question
Should the live demo reuse the full `CampaignStudio` component exactly as in `/bankdemo`, or a simplified read-only variant? Reusing the full component keeps `/bankdemo` as the ground truth and requires no extra build work.