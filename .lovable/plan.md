

# Update "Why Semantic AI is Different" -- Single Table with Ventus AI Cross-Category Columns

## What Changes

Replace the current 3-row comparison table (MCC vs Text vs Ventus for one transaction) with a single table showing **multiple diverse transactions**, where each row has:
- Raw transaction string
- MCC code
- Legacy label (generic, isolated)
- **Ventus AI Category** (accurate individual label)
- **Ventus AI Pattern** (the cross-category lifestyle signal detected across rows)

This highlights Ventus AI's dual value: accurate per-transaction labeling AND cross-category pattern detection.

## New Table Design

| Raw Transaction | MCC | Legacy Label | Ventus AI Category | Ventus AI Pattern |
|----------------|-----|-------------|-------------------|-------------------|
| REI Co-op #142 | 5941 | Retail | Sporting Goods | Outdoor Enthusiast |
| Backcountry.com | 5999 | Miscellaneous | Outdoor Gear | Outdoor Enthusiast |
| AllTrails Pro | 7372 | Digital Services | Recreation App | Outdoor Enthusiast |
| Patagonia Denver | 5651 | Apparel | Outdoor Apparel | Outdoor Enthusiast |
| RMNP Entry Fee | 7999 | Government/Fees | National Park | Outdoor Enthusiast |

- The "Legacy Label" column uses muted/yellow badges showing generic, disconnected labels
- The "Ventus AI Category" column uses blue/teal badges showing accurate granular labels
- The "Ventus AI Pattern" column uses green badges -- all showing the same unified pattern, visually reinforcing that Ventus connects them

## Subtitle Update

Change from "AI delivers accuracy legacy methods can't match" to "Detecting cross-category patterns legacy methods miss"

## Technical Details

### File: `src/pages/TePilot.tsx` (lines 575-634)
- Replace the content inside the `AccordionItem value="item-2"` block
- Update the subtitle text on line 581
- Replace the table structure (lines 586-631) with the new 5-column, 5-row table
- Use existing `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `Badge` components (all already imported)
- No new dependencies needed

