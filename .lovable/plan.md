# Keep the Unit Economics card visible before a customer is selected

Right now the Key Features card keeps its frame and shows a "Select a customer" placeholder, but the Unit Economics card is removed entirely until a customer is picked. That makes the middle column jump when a customer is selected.

## What changes

- Always render the Unit Economics card frame (header + border), matching the Key Features card.
- Before a customer is selected, the card body shows a dashed placeholder with the same muted prompt copy instead of the numbers.
- After selection, the economics rows reveal with the same 120ms staggered fade/slide used by the signal pills and the Key Features rows.
- Layout heights stay fixed so nothing shifts when the customer changes.

## Technical notes

- `SurfaceFeaturePanel.tsx`: drop the `hasSelection &&` guard on `<UnitEconomicsCard />` and pass `hasSelection` (plus `customerKey`) into it.
- `UnitEconomicsCard.tsx`: accept the new props; when not selected, render the placeholder body; when selected, apply the staggered `opacity-0 translate-y-1` → `opacity-100 translate-y-0` reveal on the value rows.
