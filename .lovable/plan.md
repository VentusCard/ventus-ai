

## Goal

Inside the phone-mockup collection detail view: (1) hide the persona pill label (e.g. "Annual Premium Hawaii Vacations"), (2) keep the friendly tagline, (3) stop truncating deal text so each deal renders fully.

## Changes — `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

### 1. Header (lines 226–229)
Replace the pill label with the `collectionMessage` tagline. Keep the offer count line.

```tsx
<div className="px-3 pt-2.5 pb-1">
  {expandedGroup.collectionMessage && (
    <p className="text-[13px] font-bold text-slate-800 leading-snug">{expandedGroup.collectionMessage}</p>
  )}
  <p className="text-[10px] text-slate-500 mt-0.5">{deals.length} offer{deals.length !== 1 ? "s" : ""} available</p>
</div>
```

If `collectionMessage` is missing, just show the count line — never the raw rollup label.

### 2. Deal cards (lines 232–256)
Remove text-clipping so each deal shows its full merchant + product + message:

- Drop `truncate` from the merchant `<p>` (line 238) and product `<p>` (line 239) → allow wrapping with `leading-snug`.
- Drop `line-clamp-1` from the message `<p>` (line 240) → allow full wrap; bump it slightly for readability (`text-[10.5px] text-slate-500 mt-1 leading-snug`).
- Change the right column (`shrink-0`) to keep the reward pill + Activate button vertically stacked but ensure the left column gets full wrap room: keep `flex items-start justify-between gap-2`, no other layout change.

No other UI changes (back button, hero image, carousel, search all untouched).

## Verification

1. `/demo` → Next-Offer tab → click a persona pill (e.g. "Annual Premium Hawaii Vacations").
2. Confirm the detail view header shows the friendly tagline ("Little things that make every island trip better.") and **not** the raw pill label.
3. Confirm each deal card shows full merchant name, product, and message text — no `…` cutoffs.
4. Long messages wrap to multiple lines cleanly.

## Out of scope

Carousel cards, top pick card, expiring soon, search, other tabs.

