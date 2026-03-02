

## Create Standalone Travel Experience Page

**New file: `src/pages/TravelExperience.tsx`**
Follow the same 6-section structure used by SmartRewards and Enrichment pages.

### Sections

1. **Hero** (dark bg `#0a0f1e`)
   - Label: "Travel Experience"
   - Headline: "Your bank becomes a travel companion." + blue italic subline: "Without tracking a single location."
   - Body text about detecting trips from spending patterns and surfacing local deals
   - Two CTAs: "Schedule Demo" + "See It Work"
   - Right column: reuse the Travel preview from PlatformTabs (the merged Miami card + deal tiles) as a static hero card

2. **Problem** (white bg, 3 pain-point cards)
   - "Banks miss the travel moment entirely."
   - Pain points: generic travel rewards, no real-time trip awareness, missed local partnership revenue

3. **See It In Action** (white bg)
   - Display the TravelLocalPreview component (extracted from PlatformTabs) as a larger, standalone demo

4. **Capabilities** (white bg, 2x2 grid)
   - Trip Detection, Local Deal Matching, Privacy-First Design, Real-Time Activation

5. **Integration** (dark bg, 3 steps — same Connect/Enrich/Activate pattern)

6. **CTA** (white bg, centered)

### Route and Nav Updates

**`src/App.tsx`** — Add route: `<Route path="/travel" element={<TravelExperience />} />`

**`src/components/PlatformTabs.tsx`** — Update the Travel Experience tab's link from `/smartrewards` to `/travel`

### Files

| File | Action |
|------|--------|
| `src/pages/TravelExperience.tsx` | Create — new standalone page |
| `src/App.tsx` | Edit — add `/travel` route |
| `src/components/PlatformTabs.tsx` | Edit — update travel tab link to `/travel` |

