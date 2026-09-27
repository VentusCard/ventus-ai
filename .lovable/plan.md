# Bank / Credit Union terminology switch for the deck

## What you'll get
A gear icon at the top right of the password page. Clicking it opens a small dialog with two choices — **Bank** or **Credit Union**. In Credit Union mode, every "bank" in the deck and the embedded platform becomes "credit union", every "customer" becomes "member", and the fictional brand "Our Bank" becomes "Our CU". The choice lasts for the browser session only.

## How it works

### 1. New term-swap module — `src/lib/institutionMode.ts`
- Stores the mode in `sessionStorage` (`deckmo_institution`, default `"bank"`).
- A case-preserving text replacer applied to displayed strings:
  - `bank → credit union`, `Bank → Credit Union`, `BANK → CREDIT UNION`
  - `customer → member`, `Customer → Member`, `CUSTOMER → MEMBER` (and plurals)
  - `Our Bank → Our CU` (checked first, so product names stay short)
- A small React context + hook (`InstitutionProvider`, `useInstitution()`) so screens re-render when the mode changes.

### 2. Gear icon on the password page — `src/components/demo/SimplePasswordGate.tsx`
- Gear icon (lucide `Settings`) top right, strict light theme.
- Opens a light-theme dialog: two radio options (Bank / Credit Union), saved on select.
- Only shown for the deckmo gate.

### 3. Apply the swap across the deck
- Wrap `/deckmo` in the provider.
- Route displayed strings through the replacer at the render points that consume deck copy: scene headers (eyebrow/title/subtitle/value block), beat caption cards, table of contents, opener and closing slides, phone mockups (activity, rewards, membership, AI chat), and the embedded platform screens on section 9.
- Roughly 150 strings across ~18 files are covered; the swap happens at render time, so the underlying data stays untouched.

## Not changing
- `/demo`, `/bankdemo`, and the rest of the site keep "bank"/"customer" wording.
- No slide content, layout, or navigation changes — only the words swap.
- Default mode stays Bank, so the deck looks exactly as it does today until someone switches.

## Verification
In a test browser: open the password page, switch to Credit Union via the gear, enter the deck, and spot-check the opener, a value section (5–8), the phone mockups ("Our CU"), section 9's embedded platform, and the closing slide. Switch back to Bank and confirm everything reverts. Check the build log.
