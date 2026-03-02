

# Homepage Redesign — Single Long-Scroll Page

## Overview
Redesign the Ventus AI homepage into a premium, single long-scroll page that consolidates About and FAQ content. Update the navbar with a Products dropdown. Remove the separate About and FAQ pages/routes.

---

## Sections to Build

### 1. Update Navbar (`src/components/Navbar.tsx`)
- Replace flat nav links with: **Products** dropdown (Transaction Enrichment, Smart Rewards, Wealth Management Copilot linking to `/enrichment`, `/smartrewards`, `/wealth`) + **Schedule Demo** button
- Remove About and FAQ links
- Use Radix dropdown menu for the Products hover/click menu
- Mobile menu: show Products as expandable section

### 2. Rewrite Hero (`src/components/Hero.tsx`)
- Headline: "Turn transaction data into *intelligence*" (intelligence in italic blue)
- New longer subheadline as specified
- Two CTAs: "Schedule Demo" (blue filled, links to `/contact`) and "View Live Demo" (outline, links to `/tepilot`)
- Remove the credibility bar

### 3. New Homepage Sections (in `src/pages/Index.tsx`)
Build each as an inline section or small component within the Index page:

**Problem Section**
- Two-column layout: left headline, right side with 3 pain point blocks separated by subtle dividers

**Platform Section**
- Label "THE PLATFORM", headline, three cards for Transaction Enrichment, Smart Rewards, Wealth Management Copilot with descriptions as specified

**Differentiation Section**
- Two-column: left bold statement, right before/after comparison block

**How It Works Section**
- Label "INTEGRATION", headline, three numbered steps with titles and descriptions

**Stats Bar**
- Four stats in a horizontal row with large numbers/text

**FAQ Accordion**
- Reuse existing `Accordion` UI components with the 5 specified Q&As

**CTA Section**
- Headline, subheadline, blue button, secondary text linking to `/tepilot`

### 4. Remove About & FAQ Routes
- Remove `/about` and `/faq` routes from `src/App.tsx`
- The page files (`src/pages/About.tsx`, `src/pages/FAQ.tsx`) can remain but will be unreferenced

---

## Technical Details

### Files Modified
| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Replace nav links with Products dropdown + Schedule Demo |
| `src/components/Hero.tsx` | New headline, subheadline, two CTAs, remove credibility bar |
| `src/pages/Index.tsx` | Add Problem, Platform, Differentiation, How It Works, Stats, FAQ, CTA sections |
| `src/App.tsx` | Remove `/about` and `/faq` routes |

### Design Approach
- All sections use `max-w-7xl` containers with consistent padding
- White background throughout, blue-600 accent color
- Clean typography: large bold headings, gray-500 body text
- Cards use `border border-gray-200 rounded-2xl` with subtle hover effects
- FAQ uses existing Accordion components
- Stats bar uses a light gray background strip (`bg-gray-50`) for visual separation
- Stripe/Plaid-inspired spacing and hierarchy

