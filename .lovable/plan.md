## Expand segments + fix branding in `CampaignStudioPreview.tsx`

### Changes

1. **More segments** — expand from 3 to **6** (one per top-category), all still built on the same 3-2-1 Cash Rewards product:
   - Dining-led households — 3% Dining / 2% Grocery — 18.4k
   - Grocery-led families — 3% Grocery / 2% Gas — 24.3k
   - Commuter households — 3% Gas / 2% Dining — 12.2k
   - Frequent travelers — 3% Travel / 2% Dining — 9.6k
   - Online shoppers — 3% Online Shopping / 2% Streaming — 15.8k
   - Wholesale-club shoppers — 3% Wholesale / 2% Grocery — 7.4k

2. **Segment tab layout** — swap the 3-column grid for a wrapped 2- or 3-per-row grid so all 6 fit cleanly. Each tab keeps: segment number, label, and **population (reachable count)** shown prominently.

3. **Population visibility** — add a small "population bar" under each tab label (thin bar scaled to the largest segment) so relative sizes are visually obvious, plus keep the numeric `18.4k reachable` line. Total reach in the header updates automatically.

4. **Remove Ventus AI Coworker branding from the draft card**:
   - Replace the avatar + "Ventus AI Coworker · Draft" header with a neutral **"Campaign draft"** header: envelope icon + "Segmented email · draft" eyebrow, segment label on the right.
   - No mention of Coworker anywhere in this component (header pill "Powered by Ventus" stays as it's the studio brand).

5. Auto-rotation, pause/play, progress bar, 3%/2%/1% chips, value-math chip and channel chips are unchanged — they just cycle through 6 segments now.

### Files touched

- `src/components/solutions/CampaignStudioPreview.tsx` only.