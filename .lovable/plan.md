
## What’s happening (deep dive)

From the codebase, there is only **one** `Footer` component and it’s used across all the marketing pages (`/`, `/technology`, `/about`, `/contact`, etc.). The `inverse` variant also exists in the shared `Button` component.

So if you still see a **blue** button (the default variant) on some pages, it strongly suggests one of these two issues:

1) **Invalid HTML nesting is causing inconsistent rendering**
- Current footer markup is:
  - `<Link>` renders an `<a>`
  - Inside it, `<Button>` renders a `<button>`
- That produces `<a><button>…</button></a>` which is invalid HTML.
- Browsers can “repair” invalid markup differently depending on surrounding DOM/layout, which can lead to unpredictable styling/behavior across pages (especially when other layout wrappers, z-index layers, or background components are present).

2) **Some CSS is overriding the intended “inverse” look in certain contexts**
- Even if `variant="inverse"` is applied, a more specific rule (or an `!important` rule) can override `bg-white text-black`.
- We didn’t find an obvious global `button { background: ... !important }` rule, but we do have other `!important` rules in the codebase (notably in `components.css` for certain components). If any page wrapper introduces a stronger selector, your inverse styles can lose.

Given your symptom (“white text and a blue button”), the most likely outcome is: **the browser is not applying the inverse variant consistently due to the invalid `<a><button/></a>` nesting**, and it falls back to the default button styling.

---

## Fix approach (robust, consistent across all pages)

### A) Fix the DOM structure: make the `Button` render as the `<a>` element
Update the footer button markup to use `asChild`:

- Before:
  - `<Link><Button variant="inverse">Contact Us</Button></Link>`
- After:
  - `<Button asChild variant="inverse"><Link to="/contact">Contact Us</Link></Button>`

This generates valid HTML:
- `<a class="...button classes...">Contact Us</a>`

This is the standard shadcn/Radix pattern and removes cross-page inconsistency risks.

### B) Make the inverse variant “un-overrideable”
To protect against any page-level CSS specificity, update the `inverse` variant string to include Tailwind important modifiers:

- `inverse: "!bg-white !text-black hover:!bg-white/90 !border-transparent"`

Optionally add:
- `shadow` for contrast against black footers
- `focus-visible:ring-offset-black` so focus ring looks correct on dark backgrounds

This ensures the inverse button stays white even if some other styles attempt to override it.

### C) Verify in all relevant page contexts
After implementing, verify on:
- `/` (Index)
- `/technology` (your current route)
- `/contact`
- one of the “capability” pages (e.g. `/enrichment`)
And also verify on mobile viewport (because mobile.css contains global-ish button rules that could affect feel/layout).

---

## Concrete file-level changes

### 1) `src/components/Footer.tsx`
- Replace the `<Link><Button/></Link>` nesting with `Button asChild` + `Link` inside.

### 2) `src/components/ui/button.tsx`
- Strengthen the `inverse` variant with `!` modifiers.
- (Optional) add a slight shadow for legibility on dark footers.

---

## Acceptance criteria (what you should see)
- On **every** page, the footer “Contact Us” control renders as:
  - a **solid white** button with **black** text
  - consistent hover state (slightly dimmer white)
- No page shows the blue default button in the footer anymore.

---

## Potential follow-up (only if still broken after A+B)
If you still see blue on any page after fixing nesting + adding `!`:
- We’ll inspect computed styles on that page and search for the exact CSS selector overriding it, then either:
  - remove/limit that selector’s scope, or
  - add a dedicated footer-only class (e.g., `.footer-cta`) with `!important` rules in one place.
