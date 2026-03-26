

## Fix WM Copilot full-height in overlay

**Problem**: `BankwideWMCopilotView` sets `height: calc(100vh - 200px)` — a value designed for the standalone page context. Inside the `DemoDetailOverlay`, this creates a mismatch because the overlay already manages height via flexbox (`flex-1`).

**Fix** — two changes:

1. **`src/components/tepilot/insights/BankwideWMCopilotView.tsx`**
   - Change the root div from `style={{ height: 'calc(100vh - 200px)' }}` to `className="flex flex-col h-full"`
   - This lets it fill whatever parent container it's in (overlay or standalone page)

2. **`src/components/demo/DemoDetailOverlay.tsx`**
   - The `isBankWide` content div already skips padding — but ensure it also passes height. Currently: `className="flex-1 overflow-y-auto"` — this is already correct for flexbox height propagation, no change needed here.

**Result**: The WM Copilot dashboard and client view will stretch to fill the full overlay height.

