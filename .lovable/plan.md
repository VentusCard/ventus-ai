

# Make Smart Rewards Page Content Wider

## What's Changing
The SmartRewards page currently uses `max-w-6xl` (72rem / 1152px) for all content sections. We'll widen this to `max-w-7xl` (80rem / 1280px) to give the content more breathing room, matching a wider layout.

## Changes

### File: `src/pages/SmartRewards.tsx`
Replace all instances of `max-w-6xl` with `max-w-7xl` across every section:
- Hero section
- Overview section
- See It In Action section
- Key Features section
- Use Cases section
- Benefits section
- CTA section

This is a single find-and-replace change affecting 7 occurrences in the file.

