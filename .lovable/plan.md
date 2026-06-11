# Sample Output: 5 CRM-ready rows with send_at timestamp

Replace the raw `MessageCard` JSON with 5 customer-ready records — one per card.

## Payload shape (per row)

```json
{
  "customer_id": "C-08421739",
  "email": "jordan.reyes@example.com",
  "subject": "...",
  "message": "...",
  "cta": "Apply now",
  "cta_url": "https://...",
  "send_at": "2026-06-12T14:00:00Z"
}
```

Field rules:
- `customer_id`: `C-` + 8 digits (seeded by product.id + card index).
- `email`: `${first}.${last}@example.com` from small built-in name pools (~20 first × 20 last).
- `subject` / `message` / `cta` / `cta_url`: copied from the matching `MessageCard` (`subject`, `body`, `cta`, `ctaHref`).
- `send_at`: ISO timestamp relative to dialog open — card 1 = now + 1h, card 2 = now + 6h, etc. (computed once when dialog opens).

Output = 5 rows total, one per card, in card order.

## Files

1. New `src/components/tepilot/campaigns/sections/buildSamplePayload.ts` — exports `buildSamplePayload(product, cards): SampleRow[]` with a tiny seeded PRNG and the name pools (~40 lines).
2. Edit `MessagePreviewsSection.tsx`:
   - Import `buildSamplePayload`.
   - Inside the dialog `<pre>`, render `JSON.stringify(buildSamplePayload(product, cards), null, 2)` instead of `cards`.
   - Dialog description: "CRM-ready audience payload for {product.name} — 5 sample sends."

No other UI/layout changes.

## Out of scope
- Real customer data, CSV download, copy-to-clipboard, multiple recipients per card.
