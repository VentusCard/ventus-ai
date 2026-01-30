
# Convert Site to Pure Black Theme

## Overview
Transform the site from a blue-tinted dark theme to a pure black theme. This involves updating CSS variables and component-level styling to use true blacks (`#000` or `hsl(0, 0%, 0%)`) instead of the current navy-blue tones.

## Current State
The site currently uses blue-tinted dark colors:
- Background: `hsl(220 50% 8%)` - dark navy blue
- Card: `hsl(220 50% 10%)` - slightly lighter navy
- Secondary: `hsl(220 40% 14%)` - muted navy
- Borders: `hsl(220 40% 20%)` - navy borders

## Changes

### 1. Update Base CSS Variables
**File:** `src/styles/base.css`

Convert all blue-tinted backgrounds to pure blacks:

| Variable | Current | New |
|----------|---------|-----|
| --background | 220 50% 8% | 0 0% 0% |
| --card | 220 50% 10% | 0 0% 5% |
| --popover | 220 50% 10% | 0 0% 5% |
| --secondary | 220 40% 14% | 0 0% 8% |
| --muted | 220 40% 17% | 0 0% 12% |
| --accent | 220 40% 16% | 0 0% 10% |
| --border | 220 40% 20% | 0 0% 15% |
| --input | 220 40% 20% | 0 0% 15% |
| --sidebar-background | 220 50% 6% | 0 0% 0% |
| --sidebar-accent | 220 40% 14% | 0 0% 8% |
| --sidebar-border | 220 40% 17% | 0 0% 12% |

Update foreground colors to work with pure black:
- --foreground: `0 0% 95%` (bright white)
- --muted-foreground: `0 0% 60%` (medium gray)

### 2. Update Component CSS
**File:** `src/styles/components.css`

Update hardcoded blue-tinted HSL values to pure black equivalents:

- `.metallic-surface`: Change `hsl(222 47% 10%)` to `hsl(0 0% 5%)`
- `.titanium-gradient`: Change navy tones to black/dark gray gradient
- `.premium-card`: Update to `hsl(0 0% 3%)` background
- `.chat-interface` and related: Update to pure black shades
- `.glass-effect`: Update to `hsl(0 0% 5%)`

### 3. Update Footer Component
**File:** `src/components/Footer.tsx`

Change `bg-slate-900` to `bg-black` and `border-slate-800` to `border-white/10`.

### 4. Update CTA Component  
**File:** `src/components/CTA.tsx`

Change `bg-[hsl(220,50%,8%)]` to `bg-black`.

## Visual Result
- Pure black backgrounds throughout the site
- Neutral gray accents instead of blue-tinted grays
- Primary blue accent color retained for interactive elements
- Better contrast with the hero section which already uses pure black
- More unified, sleek appearance

## Files to Modify
1. `src/styles/base.css`
2. `src/styles/components.css`
3. `src/components/Footer.tsx`
4. `src/components/CTA.tsx`
