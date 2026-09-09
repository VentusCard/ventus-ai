# Fix the blue gradient on the finance deal card

## What's wrong

The photo used for finance/investing deal collections no longer exists — the image address returns "not found" (404). When an image fails to load, the card silently swaps in the generic placeholder, which is a blue-to-teal gradient. That's why the finance card now shows a plain blue picture instead of a green markets photo.

Confirmed by fetching both addresses directly: the finance one returns a 404 error page, the placeholder returns the blue gradient image.

## The fix

Point the finance collection image at a verified working photo: a laptop dashboard with green financial charts that ends green (no red at the right edge).

Also drop a short comment next to the image list noting that a dead address silently falls back to the blue placeholder, so a future broken link is easier to spot.

## Technical detail

- File: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`
- `COLLECTION_IMAGE_BANK.finance`: replace `photo-1590283603380-0bf078489ff1` (404) with `photo-1460925895917-afdab827c52f`, keeping the same `?w=400&h=200&fit=crop` sizing.
- No change to `DEFAULT_IMAGE`, the alias/keyword mapping, or the `onError` fallback behavior.

## Verification

Load the offers view on `/bankdemo` and confirm the finance collection card renders the green dashboard/chart photo instead of the blue gradient.
