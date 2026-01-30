
# Add Glass Morphism Effect to Cards

## Overview
Add a semi-transparent glass/frosted glass effect to all cards across the site. This will give cards a modern, translucent appearance with backdrop blur that allows the dark background to subtly show through.

## Current State
- Base `Card` component uses opaque `bg-white` with light theme styling
- Page sections (About, Technology, FAQ, Contact) use `bg-card` which resolves to `hsl(0 0% 5%)`
- A `.glass-effect` class exists in `components.css` but uses opaque background

## Changes

### 1. Update Base Card Component
**File:** `src/components/ui/card.tsx`

Transform the Card component to use glass morphism styling:
- Change from `bg-white` to semi-transparent black `bg-white/5`
- Add stronger backdrop blur `backdrop-blur-xl`
- Update border to subtle white/10 glow
- Update text colors for dark theme (white headings, gray descriptions)

### 2. Enhance Glass Effect in CSS
**File:** `src/styles/components.css`

Update the `.glass-effect` class with proper translucency:
- Background: `hsla(0, 0%, 8%, 0.6)` (60% opacity dark gray)
- Backdrop blur: `blur(20px)`
- Border: subtle white glow `rgba(255, 255, 255, 0.08)`
- Box shadow for depth

Add new `.glass-card` utility class for consistent styling across the site.

### 3. Update About Page Cards
**File:** `src/pages/About.tsx`

Apply glass styling to section cards:
- Change `bg-card` to `bg-white/5 backdrop-blur-xl`
- Update border to `border-white/10`

### 4. Update Technology Page Cards  
**File:** `src/pages/Technology.tsx`

Apply glass styling to capability cards:
- Same treatment as About page

### 5. Update FAQ Page Accordion Items
**File:** `src/pages/FAQ.tsx`

Apply glass styling to accordion items:
- Change `bg-card` to glass effect

### 6. Update Contact Page Card
**File:** `src/pages/ContactUs.tsx`

Apply glass styling to the contact form card.

---

## Visual Result
- Cards will appear as frosted glass panels floating over the black background
- 5-10% white overlay with strong backdrop blur creates the glass effect
- Subtle white border glow adds definition
- Hover states will slightly increase opacity for interactivity
- Text remains crisp and readable with proper contrast

## Files to Modify
1. `src/components/ui/card.tsx`
2. `src/styles/components.css`
3. `src/pages/About.tsx`
4. `src/pages/Technology.tsx`
5. `src/pages/FAQ.tsx`
6. `src/pages/ContactUs.tsx`
