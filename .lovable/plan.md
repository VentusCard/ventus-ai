

## Enhance AnalyticsPreview with Cross-Sell and Card Product Details

**File: `src/components/PlatformTabs.tsx`** — rewrite `AnalyticsPreview` component to match the detail level of the other four previews.

---

### Current State

The AnalyticsPreview only shows 3 summary metrics and 5 simple pillar bars — much less detailed than the other previews.

### New Layout

Keep the 3 top-level metrics row, then replace the simple pillar bars with richer content:

**1. Pillar Bars with Penetration Detail** (keep but enhance)
- Each pillar bar now includes a secondary "competitor leakage" indicator — a small red segment showing wallet share lost
- Add account counts next to each pillar (e.g., "24.5M accounts")

**2. Cross-Sell Gap Card** (new section)
A compact card below the pillar bars showing a detected cross-sell opportunity:
- Blue left-border accent card
- "Travel cardholders missing Dining rewards — 23% gap"
- "12.4K accounts" badge + "View Segment" link-style text
- Demonstrates the cross-sell intelligence capability

**3. Card Product Matrix** (new section)
A compact 3-row table showing card product performance:

| Card Product | Penetration | Active Rate | Avg Spend |
|---|---|---|---|
| Travel Rewards | 34.2% | 82% | $18.4K |
| Cashback Plus | 28.7% | 71% | $12.1K |
| Premium Elite | 8.1% | 94% | $42.8K |

Each row uses small colored dots matching a product color, with the highest "Active Rate" highlighted in green.

### Sample Data

**Pillar bars** (enhanced):
- Travel: 20.4% — 24.5M accounts — 4.2% leakage
- Dining: 18.2% — 21.8M accounts — 6.1% leakage  
- Wellness: 14.1% — 16.9M accounts — 3.8% leakage
- Shopping: 12.3% — 14.8M accounts — 5.5% leakage

**Cross-sell card**:
- Gap: "Travel cardholders missing Dining rewards"
- Size: "12.4K accounts"
- Percentage: "23% gap"

**Card product table**:
- 3 rows as described above

### Technical Notes

- All inline data, no imports needed
- Uses same compact styling patterns (text-[10px], text-[11px], rounded-lg borders) as the other previews
- Compact enough to fit within the ~300px min-height preview area
- Pillar bars reduced from 5 to 4 to make room for the new sections

