
# Fix Dim Footer Text and Button

## Issue Analysis

Looking at the screenshot, the footer has visibility problems:

1. **"Get in Touch" heading** - appears dim/faded
2. **Description text** - very hard to read against the dark background  
3. **"Contact Us" button** - shows as an outlined button (border only, no fill) instead of a solid white button
4. **Copyright text** - too faded

The button issue appears to be a CSS specificity problem where the custom `className` isn't properly overriding the Button component's default variant styles.

## Solution

### Footer.tsx Updates

| Element | Current | Fix |
|---------|---------|-----|
| "Get in Touch" heading | `text-white` | Keep, but ensure no opacity reduction |
| Description text | `text-white/70` | Increase to `text-white/80` for better contrast |
| Button | Custom className being overridden | Use `!important` via Tailwind's `!` prefix or inline styles |
| Copyright | `text-white/60` | Increase to `text-white/70` |

### Button Fix Options

The Button component uses `cn()` which should merge classes, but the default variant (`bg-primary`) may have higher specificity. Solutions:

1. **Force override with `!` prefix**: `!bg-white !text-black`
2. **Use inline style**: More reliable for critical overrides
3. **Add a new button variant**: Create an `inverse` variant for dark backgrounds

I recommend option 1 (Tailwind's `!` important prefix) as the cleanest solution.

## Technical Changes

```tsx
// Footer.tsx - Updated button with forced overrides
<Button 
  size="sm" 
  className="!bg-white !text-black hover:!bg-white/90 border-0"
>
  Contact Us
</Button>

// Increased text contrast
<p className="text-white/80 text-sm mb-4">  // Was white/70
<p className="text-white/70 text-sm">       // Copyright, was white/60
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Footer.tsx` | Force button styles with `!` prefix, increase text opacity values |

## Visual Result

```text
Before:                          After:
┌─────────────────────────┐      ┌─────────────────────────┐
│ VENTUS AI (ok)          │      │ VENTUS AI (bright)      │
│ Description (dim)       │      │ Description (clear)     │
│                         │      │                         │
│ Get in Touch (dim)      │      │ Get in Touch (bright)   │
│ Questions? (very dim)   │      │ Questions? (readable)   │
│ [━━━━━━━━] outline btn  │      │ [████████] solid white  │
│                         │      │                         │
│ © 2026... (faded)       │      │ © 2026... (visible)     │
└─────────────────────────┘      └─────────────────────────┘
```
