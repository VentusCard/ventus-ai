## Plan: Increase text and content sizes across cards

### Beat 3 — "MCCs are blind" card

- MCC badge text `text-base` → `text-lg`
- Sub-label "This is what the banks use…" `text-sm` → `text-base`
- Emoji circles `w-16 h-16 text-2xl` → `w-20 h-20 text-3xl`
- Category labels `text-xs` → `text-sm`
- Ellipsis dots `text-3xl` → `text-4xl`

### Beat 4 — "Purchase Patterns" card

- MCC badge text `text-sm` → `text-base`
- Merchant name `text-base` → `text-lg`
- Amount `text-base` → `text-lg`
- "Expecting a Baby" pill text `text-base` → `text-lg`

### Beat 5 — "Signal Activation" cards

- Signal/demographics pill text `text-sm` → `text-base`
- **Personalized Rewards card**: icon `text-lg` → `text-2xl`, title `text-sm` → `text-base`, description `text-[11px]` → `text-sm`, grid item labels `text-xs` → `text-sm`, padding `p-4` → `p-6`
- Grid item labels in Relationship & UX cards already at `text-sm` — bump to `text-base`

### Files modified

- `src/components/demo/DemoPasswordGate.tsx` — size class bumps only, no structural changes