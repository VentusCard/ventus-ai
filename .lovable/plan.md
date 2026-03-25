

## Remove "Describe Your Customer" Section from Custom Flow

### What changes
In `src/components/demo/DemoCustomerPanel.tsx`, simplify the custom customer mode by removing:
- **Step 1** — the "Describe your customer" textarea and `personaText` state
- **Step 2** — the "Copy prompt" button (renumber step 3 → step 1)

The `handleCopyPrompt` function and `personaText` state become unused and should be removed. The `buildCustomerPrompt` call will use a default persona string instead of user input.

Update the remaining steps:
- **Step 1** (was 3): "Copy prompt → paste into ChatGPT / Claude" with the copy button (uses default persona)
- **Step 2** (was 3): "Paste the full LLM output below" textarea + Load button

### File
`src/components/demo/DemoCustomerPanel.tsx`
- Remove `personaText` state
- Remove Step 1 `<div>` block (lines 181-190)
- Update `handleCopyPrompt` to use a hardcoded default persona
- Renumber remaining steps from 1/2

