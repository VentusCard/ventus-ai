# Make the preview serve the actual code (stale dev-server cache)

## Problem
The Section 4 pop-up fixes are saved on disk (wider pop-up, 120px Rail column, no truncation), but the live preview still serves the old layout — your screenshot shows "Premi…" / "Cashb…" clipped in the Rail column. The dev server is holding a stale cached copy of the transformed files, so edits never reach the browser.

## Fix
1. Clear the dev server's dependency cache (`node_modules/.vite`) and restart the dev server using the supervised restart procedure.
2. Confirm the server is back up and serving the current source (the pop-up code with the wide Rail column).
3. Hard-reload the preview.

## Verification
- Open the Bi-weekly tennis pop-up (the one in your screenshot) at 1903×1024: Rail shows "Premium Card" / "Cashback Card" in full, no clipped cells.
- Spot-check two more pop-ups (a Financial one and an external one) and the Section 4 vertical spacing / larger family headings, which were stuck behind the same stale cache.
- Run the deck test suite.

## Technical details
- Restart follows the supervised dev-server procedure (kill + wait loop, within the restart budget); only `node_modules/.vite` is deleted, never `node_modules` itself or the lockfile.
- No source-code changes — the code on disk is already correct; this is purely a server/cache refresh.
