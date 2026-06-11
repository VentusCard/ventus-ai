Make the Addressable population card (AudiencePanel) match the height of the neighboring selected-product card in ProductPickerSection.

## What changes
- Swap the grid's cross-axis alignment from `items-start` to `items-stretch` so both columns share the same height.
- Make the right-column wrapper a full-height flex column (`h-full flex flex-col`).
- Make the Filters card shrink-to-fit and the AudiencePanel grow (`flex-1`) so it fills the remaining vertical space and ends up the same height as the product card on the left.

## File
- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`