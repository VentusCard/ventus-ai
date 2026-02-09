

# Add Smart Animations to Technology Page

## Overview

Transform the `/technology` page with sophisticated animations that match the premium feel of the Hero component, including staggered entrance animations, animated background, hover micro-interactions, and subtle parallax effects.

## Current State

The Technology page is static with basic hover transitions on the capability cards. It lacks:
- Entrance animations for content
- Animated background elements
- Icon animations
- Scroll-triggered effects

## Proposed Animations

### 1. Animated Background (Gradient Orbs)

Add a subtle version of the GradientOrbs background used on the homepage to create visual continuity and depth.

| Element | Animation | Purpose |
|---------|-----------|---------|
| Gradient orbs | Slow breathing/morphing | Creates ambient movement without distraction |
| Subtle grid pattern | Static with fade | Adds tech/data aesthetic |
| Vignette overlay | Static | Focuses attention on center content |

### 2. Header Entrance Animations

Staggered fade-up animations for the page title and subtitle:

| Element | Animation | Delay |
|---------|-----------|-------|
| "What We Do" heading | fade-float + scale-up | 0.1s |
| Subtitle paragraph | fade-float | 0.3s |

### 3. Capability Card Animations

Staggered entrance with enhanced hover states:

| Element | Animation | Details |
|---------|-----------|---------|
| Card entrance | fade-float + slide-up | Staggered by index (0.1s increments) |
| Icon container | pulse-glow on hover | Subtle glow effect |
| Icon | scale + rotate on hover | Micro-interaction |
| Arrow | slide-right on hover | Already exists, enhance timing |
| Card border | gradient shimmer on hover | Premium feel |

### 4. Icon-Specific Animations

Each icon gets a unique micro-animation on card hover:

| Icon | Animation |
|------|-----------|
| Brain | Subtle pulse/throb |
| Gift | Gentle bounce |
| Users | Slight wave/shift |
| Briefcase | Tilt effect |

### 5. Scroll-Reveal for Cards

Cards animate in as they enter viewport (optional enhancement using CSS intersection observer pattern or simple delay-based approach).

## Implementation Approach

### New Component: TechnologyBackground.tsx

A simplified version of GradientOrbs optimized for the Technology page:
- Darker, more subtle gradients
- Slower animations
- Lighter performance footprint

### Updates to Technology.tsx

```text
Structure:
┌────────────────────────────────────────────────────────────────┐
│ [TechnologyBackground - animated gradient orbs, grid overlay] │
│                                                                │
│   ┌──────────────────────────────────────────────────────┐    │
│   │  "What We Do"     animate-fade-float delay-100ms     │    │
│   │   Subtitle        animate-fade-float delay-300ms     │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                                │
│   ┌────────────────┐  ┌────────────────┐                      │
│   │  Card 1        │  │  Card 2        │  delay: 0.2s, 0.3s   │
│   │  Icon: pulse   │  │  Icon: bounce  │                      │
│   │  hover: glow   │  │  hover: glow   │                      │
│   └────────────────┘  └────────────────┘                      │
│   ┌────────────────┐  ┌────────────────┐                      │
│   │  Card 3        │  │  Card 4        │  delay: 0.4s, 0.5s   │
│   │  Icon: wave    │  │  Icon: tilt    │                      │
│   └────────────────┘  └────────────────┘                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Tailwind Config Additions

Add these new keyframes and animations:

```typescript
keyframes: {
  'icon-pulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' }
  },
  'icon-bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-4px)' }
  },
  'icon-tilt': {
    '0%, 100%': { transform: 'rotate(0deg)' },
    '50%': { transform: 'rotate(8deg)' }
  },
  'card-glow': {
    '0%, 100%': { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
    '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }
  }
}
```

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/technology/TechnologyBackground.tsx` | Create | Animated gradient background component |
| `src/pages/Technology.tsx` | Modify | Add background, entrance animations, enhanced card hover states |
| `tailwind.config.ts` | Modify | Add icon animation keyframes |

## Card Animation Details

Each card will have:

1. **Entrance Animation**:
   ```tsx
   className="animate-fade-float"
   style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'backwards' }}
   ```

2. **Hover State**:
   ```tsx
   className="group ... hover:shadow-xl hover:scale-[1.02] hover:border-primary/30"
   ```

3. **Icon Animation on Hover**:
   ```tsx
   <capability.icon className="... group-hover:scale-110 group-hover:text-primary transition-all" />
   ```

4. **Glow Effect on Icon Container**:
   ```tsx
   <div className="... group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:bg-primary/20">
   ```

## Visual Preview

```text
Before:                          After:
┌─────────────────┐              ┌─────────────────┐
│ Static card     │              │ ✨ Animated BG  │
│ Basic hover     │     →        │ 🎯 Staggered in │
│ No depth        │              │ 💫 Hover glow   │
│ Simple icons    │              │ 🔄 Icon animate │
└─────────────────┘              └─────────────────┘
```

## Performance Considerations

- Use `will-change` sparingly for animated elements
- Background uses `mix-blend-mode` and `filter: blur()` efficiently
- Animations use GPU-accelerated properties (transform, opacity)
- `prefers-reduced-motion` media query respected

## Benefits

- Creates visual continuity with the Hero section
- Premium, polished feel matches "smart AI" branding
- Micro-interactions provide satisfying feedback
- Staggered animations guide user attention
- Maintains fast performance with CSS-only approach

