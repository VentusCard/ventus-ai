## Fix

In `src/components/exec-demo/NextOfferRationale.tsx` at lines 67–69, replace the static "Behavioral Based Deal Collection" header with a dynamic one that uses `group.collectionMessage` (already typed on the group).

```tsx
<div className="font-bold text-base text-slate-900 mb-2">
  Dynamic Collection:{group.collectionMessage ? ` ${group.collectionMessage}` : ""}
</div>
```

Result: the middle column's offer-rationale card header reads e.g. `Dynamic Collection: Little things that make every island trip better.`

If `collectionMessage` is missing on a group, it gracefully falls back to just `Dynamic Collection:`.

No edge function or phone-view changes — only the middle (intel) panel.
