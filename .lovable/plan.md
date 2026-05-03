## Stack title above chips in Ingest / Hands Off To sliver

In `src/components/exec-demo/NextConversationRationale.tsx`, change each half of `PipelineSliver` from a single horizontal row (label + chips inline) to two stacked rows:

- Row 1: the section title ("Ingest" / "Hands Off To") — bigger, bolder, darker.
- Row 2: the horizontal chip list (unchanged behavior — `flex-nowrap`, clip overflow).

### Changes

Replace the inner `<div>` for each half with:

```tsx
<div className="flex flex-col gap-1.5 px-4 py-2.5 overflow-hidden min-w-0">
  <div className="flex items-center gap-1.5 shrink-0">
    <Icon className="w-3.5 h-3.5 text-slate-700" />
    <span className="text-[13px] font-bold tracking-wide text-slate-900 uppercase">{label}</span>
  </div>
  <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-nowrap">
    {items.map(item => (
      <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">{item}</span>
    ))}
  </div>
</div>
```

Title goes from `text-[10px] font-semibold text-slate-500` → `text-[13px] font-bold text-slate-900`, and icon from `text-slate-400 w-3 h-3` → `text-slate-700 w-3.5 h-3.5`.

No other changes.
