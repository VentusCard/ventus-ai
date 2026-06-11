# Replace footer caption with a "Sample Output" button

File: `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` (lines 253–261).

## Change

Delete the `<div className="mt-3 pt-3 border-t border-slate-100 ...">` block that renders:

> Catalog total · 1,142 distinct campaigns across 44 products
> Credit Cards · 548 campaigns

Replace it with a single right-aligned **blue "Sample Output"** pill button at the bottom of the section:

```tsx
<div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
  <button
    type="button"
    onClick={() => setSampleOpen(true)}
    className="inline-flex items-center gap-1.5 rounded-full border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 hover:border-blue-700 transition-colors"
  >
    <FileJson className="w-3.5 h-3.5" />
    Sample Output
  </button>
</div>
```

## Sample Output dialog

Clicking opens a light-theme shadcn `<Dialog>` showing the message cards currently in `cards` as a formatted JSON payload (the same shape a downstream system would consume). Code block uses `font-mono text-[11px]` inside a scrollable `max-h-[60vh] overflow-auto` `<pre>` with `bg-slate-50 border border-slate-200 p-3 rounded-md`. Dialog title: "Sample Output", description: "Generated campaign payload for {product.name}". No copy/download actions in this pass — just preview.

State: `const [sampleOpen, setSampleOpen] = useState(false);` added at top of `MessagePreviewsSection`.

## Cleanup
- Remove the now-unused `CATALOG_GRAND_TOTAL` import if it was only used in this footer.
- Keep `variants` import only if still referenced elsewhere in the file (it was only on this footer line — also remove if unused after the edit).

## Out of scope
- Other sections, other files, copy-to-clipboard, real export logic.
