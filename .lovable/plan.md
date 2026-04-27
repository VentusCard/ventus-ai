# Add tagline to /demo password gate

Add the line **"AI Customer Intelligence for Banks"** between the Ventus logo and the three feature bullets on the `/demo` (executive demo) password gate. Leave the `/demo-customer` (DemoPage) gate untouched.

## Changes

### 1. `src/components/demo/SimplePasswordGate.tsx`
- Add a new optional prop `tagline?: string` to the `Props` interface.
- Render the tagline (when provided) as a centered subtitle directly below the logo and above the bullets grid.
- Styling: Manrope, semibold, slate-600, ~`text-[22px] md:text-[26px]`, tracking-tight, with a small top margin offset from the logo (the existing wrapper uses `gap-8`, so place it inside its own container so spacing reads as logo → tagline → bullets without doubling the gap).

Concretely, wrap logo + tagline in a flex column with tight gap, so the visual hierarchy is:
```
[ logo ]
AI Customer Intelligence for Banks
   • bullet  • bullet  • bullet
   [ password input ]
```

### 2. `src/pages/ExecDemoPage.tsx` (line 907)
- Pass `tagline="AI Customer Intelligence for Banks"` to `<SimplePasswordGate>` alongside the existing `bullets` prop.

## Out of scope
- `DemoPage.tsx` (`/demo-customer`) — no tagline added; behavior unchanged.
- No copy/style changes elsewhere.
