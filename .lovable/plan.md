

# Standardize All Four Technology Pages for Consistency

## Problem
The **Enrichment** page uses different container widths and vertical spacing compared to the other three pages (Smart Rewards, Engagement, Wealth), creating an inconsistent feel when navigating between them.

## What's Different

| Section | Enrichment (current) | SmartRewards / Engagement / Wealth |
|---|---|---|
| All containers | `max-w-6xl` (1152px) | `max-w-7xl` (1280px) |
| Demo section padding | `py-6` | `py-12` |
| Features section padding | `py-6` | `py-12` |
| Use Cases section padding | `py-6` | `py-12` |
| Benefits section padding | `py-6` | `py-12` |
| CTA section padding | `py-10` | `py-16` |

SmartRewards, Engagement, and Wealth are already perfectly consistent with each other. Only Enrichment needs updating.

## Changes

### File: `src/pages/Enrichment.tsx`

Update all section containers to match the standard used by the other three pages:

1. **Hero section (line 81)**: `max-w-6xl` to `max-w-7xl`
2. **Overview section (line 115)**: `max-w-6xl` to `max-w-7xl`
3. **Demo section (line 134)**: `py-6` to `py-12`
4. **Demo container (line 135)**: `max-w-6xl` to `max-w-7xl`
5. **Features section (line 152)**: `py-6` to `py-12`
6. **Features container (line 153)**: `max-w-6xl` to `max-w-7xl`
7. **Use Cases section (line 187)**: `py-6` to `py-12`
8. **Use Cases container (line 188)**: `max-w-6xl` to `max-w-7xl`
9. **Benefits section (line 222)**: `py-6` to `py-12`
10. **Benefits container (line 223)**: `max-w-6xl` to `max-w-7xl`
11. **CTA section (line 242)**: `py-10` to `py-16`
12. **CTA container (line 244)**: `max-w-6xl` to `max-w-7xl`

No changes needed for SmartRewards, Engagement, or Wealth -- they are already consistent.

