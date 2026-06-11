## Restore "Change product" action on the selected product card

In `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`, add a small "Change product" button to the selected-product detail block (the slate-50 card at lines 72–95) so users can swap the picked product without first interacting with the search input.

### Behavior
- Button sits top-right of the selected card header, aligned with the product name row.
- Clicking it clears the selection back to the search state — calls `onSelect("")` so the parent unsets `selectedId`, and focuses the search input.
- Label: "Change product"; icon: `Pencil` or `ArrowLeftRight` from lucide-react (lean `ArrowLeftRight`).
- Styling: ghost text button, `text-[11px] text-slate-500 hover:text-slate-900`, no border, to stay within the strict light theme.

### Technical notes
- Add a `ref` on the search `<Input>` and call `.focus()` after clearing.
- Confirm parent (`CampaignStudio` or wherever `ProductPickerSection` is mounted) accepts `""` as a valid `selectedId` — if it requires a non-empty id, instead surface the search dropdown by seeding `query` with a space or expose an `onClear` prop. Quick check of the parent during implementation will decide which path.

No other files or filter logic touched.