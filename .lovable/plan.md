

## Update Beat 5 Signal + Demographics Pills

**File**: `src/components/demo/DemoPasswordGate.tsx`

**Lines 489–517** — Replace the current life event badge and plain-text demographics with two matching pill badges:

1. **Life Event pill** (keep existing style, update text): "Life Event: Expecting a Baby" with the heart icon
2. **Plus sign** (keep as-is)
3. **Demographics pill** (new, matching style): "Demographic Information: Age, Income, ZIP Code" with a `Users` lucide icon — same `rounded-full px-5 py-2.5` styling, same blue color scheme as the life event pill

Remove the plain-text demographic items (Age 32 · HHI $145K · ZIP 60614 · Married).

