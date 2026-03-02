

## Add Hospitality Greeting and "Explore National Deals" Card to Travel & Local Preview

**File: `src/components/PlatformTabs.tsx`** — update `TravelLocalPreview` component.

### Changes

**1. Hospitality Welcome Line** (new, between trip card and deal cards)

Add a personalized greeting banner after the detected trip card:

- Light blue/gray background rounded card
- Text: **"Hi John, welcome to Miami!"** (bold) followed by "Your Ventus Bank Membership gets you the following deals:"
- Small bank logo or membership badge icon (using a simple styled span)

**2. "Explore National Deals" Card** (new, after the 3 deal cards)

Add a final card at the bottom styled as a CTA:

- Dashed border, subtle blue background
- Text: **"Explore National Deals"** with a subline like "200+ deals available nationwide"
- Right-pointing arrow indicator
- Styled to look tappable/clickable, distinct from the deal cards above

### Updated Layout Order

```text
1. Detected Trip card (Miami, FL — unchanged)
2. Hospitality greeting: "Hi John, welcome to Miami! Your Ventus Bank Membership gets you the following deals:"
3. Deal card: Perez Art Museum (Arts)
4. Deal card: Zuma Miami (Dining)
5. Deal card: Bayside Marketplace (Shopping)
6. CTA card: "Explore National Deals" — 200+ deals available nationwide
```

### Technical Notes

- No new imports — uses inline JSX and Tailwind only
- Greeting uses `text-[13px]` for the name and `text-[11px]` for the subline
- National Deals card uses `border-dashed border-blue-200 bg-blue-50/50` to differentiate from regular deal cards
- Arrow rendered with a simple `→` character

