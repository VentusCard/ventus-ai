# Fix /bankdemo finance collection image color

## Problem
In `/bankdemo`, the curated image bank for generated offer collections uses a red-toned stock/finance photo for the `finance` category. The user wants a green-toned replacement.

## Location
`src/components/exec-demo/GeneratedOffersPhoneView.tsx`
- `COLLECTION_IMAGE_BANK` object, `finance` key (currently `photo-1611974789855-9c2a0a7236a3`).

## Change
Replace the `finance` Unsplash URL with a green finance/stock-chart photo:
```ts
finance: "https://images.unsplash.com/photo-1590283603380-0bf078489ff1?w=400&h=200&fit=crop",
```

## Verification
- Run `bun run build` to confirm no type/bundling errors.
- Open `/bankdemo`, trigger an offer flow that maps to the `finance` image category, and confirm the collection card now shows a green-toned image.

## Scope
Only the image URL changes. No logic, copy, or other UI changes.