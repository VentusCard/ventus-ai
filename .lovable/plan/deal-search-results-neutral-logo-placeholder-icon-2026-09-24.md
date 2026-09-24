# Deal search results: neutral "[logo]" placeholder icon

## What changes
On the slide 6 phone (search results in `GeneratedOffersPhoneView.tsx`), each deal row's icon changes from the per-category colored line icon to a neutral merchant-logo placeholder:

- Replace the icon box (currently a category icon tinted with the category color) with a square placeholder box that literally reads **[logo]** in small text.
- All placeholders are identical and neutral — same slate/gray styling for every row, no per-category colors on the icon.
- Keep everything else as-is: row layout, one deal per row, merchant name, description, reward pill, and the left color bar (category colors stay there; only the icon goes neutral).

## Technical detail
File: `src/components/exec-demo/GeneratedOffersPhoneView.tsx` (search-results rows, ~lines 458–488)

- Remove the `CategoryIcon` lookup and icon render.
- Render instead: a `w-9 h-9` rounded box, `bg-slate-100` with a `border-slate-200` border, containing the text `[logo]` at ~7px, slate-400, centered, non-selectable.
- The per-category `c` color styling stays on the reward pill and left bar only.

## Verification
- Build + typecheck clean.
- Playwright on /deckmo: run the "coffee machine" search on slide 6 and screenshot the results — every row shows the same neutral [logo] placeholder, rows keep their height, no layout break.
