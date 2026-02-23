

# Fix White Text on Local Experiences City Badge

## Problem
The city badge next to "Local Experiences" (showing e.g. "San Francisco") still displays white/light text instead of black, despite the previous edit adding `text-black`.

## Root Cause
The Badge component's `outline` variant applies `text-foreground` via class-variance-authority (CVA). CVA classes can sometimes win over appended utility classes depending on Tailwind's CSS layer ordering. Adding `!text-black` (with the important modifier) will guarantee the override.

## Fix
**File: `src/components/tepilot/insights/DealActivationPreview.tsx` (line 815)**

Change the Badge className to use `!text-black` to force the override, and also set the MapPin icon explicitly to black:

```
Before:
  <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-primary/30 bg-primary/5 text-black">
    <MapPin className="h-2.5 w-2.5 mr-0.5" />

After:
  <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-primary/30 bg-primary/5 !text-black">
    <MapPin className="h-2.5 w-2.5 mr-0.5 text-black" />
```

This is a one-line styling fix in a single file.
