

# Fix Mobile/Tablet Navbar Transparency

## Problem
The mobile hamburger menu and its expanded dropdown are transparent, causing page text to show through and overlap with navigation links.

## Solution
Make the navbar and mobile menu overlay solid on mobile/tablet while keeping desktop transparent. The menu will overlay on top of page content (not push it down).

## Technical Changes

### File: `src/components/Navbar.tsx`

1. **Navbar container (line 19)**: Change `bg-transparent` to `bg-background/90 md:bg-transparent` so mobile/tablet gets a solid dark background while desktop stays transparent.

2. **Mobile menu dropdown (line 86)**: Change `bg-background/98` to `bg-background` for a fully opaque overlay, and ensure it has proper z-index to sit above page content.

