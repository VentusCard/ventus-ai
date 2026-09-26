# Fix Beat 6.5 Collection Header Image

## Goal
Make the holiday-travel header image fully visible on beat 6.5 while retaining the deal count, all five complete offer descriptions, and the roomier offer cards.

## Changes
- Remove the short 40–48px cropped-image treatment in the presentation collection view.
- Restore the image to its natural 2:1 composition so the full preview is visible without distortion or clipping.
- Rebalance only existing vertical spacing and the short-viewport phone sizing to create enough room; do not add or remove any collection elements.
- Preserve the immediate 6.4 → 6.5 collection opening, merged deal titles, five-offer count, full descriptions, rewards, and action buttons.
- Keep the regular `/demo` collection layout unchanged.

## Validation
- Navigate through 6.4 → 6.5 and confirm the collection opens immediately.
- Verify the complete header image and all five offers are visible without internal scrolling or clipped text at 1540×855, 1880×1130, and 1920×1080.
- Check the preview for visual overlap and confirm a clean build.

## Technical detail
The current presentation image container is only 48px tall, dropping to 40px on short screens, while the source image is 2:1 and the image uses `object-cover`. The fix will use an aspect-correct presentation container and recover space from the phone's presentation-only sizing and spacing rather than cropping the image.
