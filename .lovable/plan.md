## Add preset + campaign link to the Offers card

Extend the Offers card in Step 1 with (a) a one-click preset and (b) a campaign link field. Both flow downstream into message previews.

### UI additions in `ProductPickerSection.tsx`

Inside the Offers card (the 25% middle column), above the free-text input:

```text
Preset:  [+ Double rewards until EOY]   ← one-click adds to offers
[ text input: e.g. Double rewards through EOY ] [+]
Active: chip · chip (×)
─────────────────────────────────────
Campaign link
[ https://www.ventusai.com/...      ]
```

- Preset chip: small pill button. Clicking it calls the same `addOffer` path with the literal `"Double rewards until EOY"`. Disabled once that exact offer is already active or the 5-cap is hit.
- Campaign link field: separated by a thin `border-t border-slate-100`. Compact `Input` with placeholder `https://www.ventusai.com/campaign`. Defaults to `https://www.ventusai.com` when the user selects a product. Trimmed; no client-side URL validation beyond basic non-empty.
- Strict light theme, no `dark:` classes.

### State lift

`ProductCampaignBuilderView.tsx` already owns `offers`. Add a sibling `campaignLink: string` state, default `"https://www.ventusai.com"`, reset alongside `offers` whenever the product changes. Pass `campaignLink` + `onCampaignLinkChange` into `ProductPickerSection`, and `campaignLink` into `MessagePreviewsSection`.

### Downstream effect

`MessagePreviewsSection` forwards `campaignLink` to `buildMessageCards(product, variants, offers, campaignLink)`.

In `buildMessageCards.ts`:
- Extend `MessageCard` with an optional `ctaHref?: string`.
- When `campaignLink` is non-empty, attach it as `ctaHref` to every generated card.

In `MessagePreviewsSection.tsx` render:
- Convert the existing `<button>` CTA to an `<a href={card.ctaHref} target="_blank" rel="noopener noreferrer">` when `ctaHref` is present, falling back to a `<button>` when absent. Same visual styles.

### Files touched

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — add preset chip, campaign link input, two new props.
- `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx` — own `campaignLink`, reset on product change, pass through.
- `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` — accept and forward `campaignLink`; CTA renders as anchor when href present.
- `src/components/tepilot/campaigns/sections/buildMessageCards.ts` — add optional `ctaHref`; attach `campaignLink` to each card.

### Out of scope

- No URL validation library, no link analytics, no persistence.
- No additional presets (only the one requested).
