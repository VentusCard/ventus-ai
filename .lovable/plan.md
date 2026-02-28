

# Redesign Ventus AI Homepage -- Light, Premium, Enterprise

## Overview
Complete redesign of the homepage (`/`) from dark/particle-heavy to a clean white enterprise aesthetic inspired by Stripe/Plaid. White background throughout, minimal nav, soft blue aurora blob, credibility bar, and a clean CTA section.

## Files to modify

### 1. `src/components/Hero.tsx` -- Full rewrite
- **White background** instead of black
- **Headline**: Large bold black text -- "Turn transaction data into *intelligence*" with "intelligence" in italic blue (`text-blue-600 italic`)
- **Soft blue aurora blob**: A CSS radial gradient blob (blue-to-transparent) positioned behind the hero text, subtle and blurred, no particle animations
- **Remove**: GradientOrbs, DataNetworkSVG, useMouseParallax, all parallax logic, brushstroke SVG
- **Subheading**: Gray text below headline -- "Beyond basic enrichment -- interpreting transaction data to reveal consumer intent, behavior, and life events"
- **CTA button**: Blue "Schedule Demo" button linking to `/contact`, plus a secondary "Learn More" linking to `/technology`
- **Credibility bar**: Below the hero content, a thin section with subtle top border line saying "Trusted by top 10 US financial institutions" in small gray text

### 2. `src/components/Navbar.tsx` -- Restyle for white theme
- White/transparent background with subtle bottom border (`border-b border-gray-100`)
- Logo on left, nav links center-ish, "Schedule Demo" blue button on right
- Nav link text: `text-gray-600 hover:text-gray-900` instead of white
- Mobile menu: white background with gray text
- Remove `bg-background/90` and dark-themed classes

### 3. `src/components/CTA.tsx` -- White background CTA
- White background instead of black
- Dark text (`text-gray-900`) for heading
- Gray subtext
- Blue "Contact Us" button (default primary variant)
- Clean, minimal layout

### 4. `src/components/Footer.tsx` -- Light footer
- Light gray background (`bg-gray-50`) instead of black
- Dark text for headings, gray for body text
- Subtle top border

### 5. `src/pages/Index.tsx` -- Minor wrapper update
- Ensure `min-h-screen bg-white` on the wrapper div

## Design details

### Aurora blob effect (in Hero)
Two overlapping `div` elements with:
- `bg-blue-400/20` with large `blur-[120px]` -- positioned top-right
- `bg-indigo-300/15` with `blur-[100px]` -- positioned bottom-left
- Both absolutely positioned behind the text content
- Subtle, soft, no animation needed (static glow)

### Typography
- Headline: `text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900`
- "intelligence" keyword: `italic text-blue-600 font-semibold`
- Subheading: `text-lg md:text-xl text-gray-500`

### Credibility bar
- Thin `border-t border-gray-200` divider
- Centered text: "Trusted by top 10 US financial institutions" in `text-sm text-gray-400 tracking-wide uppercase`
- Sits at the bottom of the hero section with some padding

### Color approach
- The homepage components will use hardcoded white/gray/blue Tailwind classes rather than CSS variables, since the rest of the site (Technology, TePilot, etc.) still uses the dark theme via CSS variables
- This scopes the light redesign to the homepage only without breaking other pages
