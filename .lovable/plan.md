
# Remove Key Features Section from TePilot Cover Page

## Overview

Remove the "Key Features" accordion section from the TePilot password entry page to streamline the cover page content.

## Change Required

Delete the entire AccordionItem with `value="item-3"` (lines 630-734) which contains the "Key Features" section with 10 feature cards.

## File to Modify

| File | Change |
|------|--------|
| `src/pages/TePilot.tsx` | Remove lines 630-734 (the Key Features AccordionItem) |

## Result

The TePilot cover page will have 3 accordion sections instead of 4:
1. Ventus AI Workflows
2. Why Semantic AI is Different
3. Use Cases

The Key Features section will no longer appear on the page.
