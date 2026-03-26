

## Wrap "Personalized Banking Relationship" in an iPad Mockup

### What changes

**`src/components/demo/DemoWealthView.tsx`**

Wrap the existing consumer-facing content in an iPad-style device frame:

- **Outer container**: centered, `max-w-[820px]` wide (iPad landscape proportion)
- **Device bezel**: rounded-2xl with slightly thicker border than the phone mockups to convey a tablet form factor, subtle shadow
- **Browser bar**: same pattern as the phone mockups (traffic-light dots + URL bar showing `yourbank.com/banking`) but slightly larger to match tablet scale
- **Content area**: scrollable inner div with `max-h-[600px]` containing the existing greeting header, life events hero cards, financial snapshot, and fallback — all content stays the same, just wrapped in the iPad frame
- **Sizing**: text and spacing remain the same since the content was already designed for a wider layout (`max-w-2xl`)

No other files need to change. The same pattern will later be reusable when the user updates the other 2 views.

