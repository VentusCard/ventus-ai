
# Switch Site Font to Inter

## Overview

Replace Rubik with Inter as the primary font across the entire site. Inter is a geometric sans-serif designed specifically for screens, known for its sharp edges, excellent legibility, and professional tech aesthetic.

## Changes Required

### 1. Update Google Fonts Import (index.html)

Replace the current Rubik font import with Inter:
- Remove: `family=Rubik:ital,wght@0,300..900;1,300..900`
- Add: `family=Inter:wght@300;400;500;600;700;800;900`

### 2. Update Tailwind Font Configuration (tailwind.config.ts)

Update the fontFamily settings:
```
sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif']
display: ['"Inter"', 'system-ui', 'sans-serif']
```

## Files to Modify

| File | Change |
|------|--------|
| `index.html` | Update Google Fonts link to load Inter |
| `tailwind.config.ts` | Replace Rubik with Inter in fontFamily config |

## Result

The entire site will render with Inter, giving a sharper, more professional tech aesthetic while maintaining all existing font weights and styles.
