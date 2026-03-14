

# Center Initial Content Vertically

## Problem
The active beat content starts with `pt-8` top padding, which positions it too high on the screen at Beat 1. This creates excessive empty space below and makes the content feel off-center.

## Solution
Increase the top padding on the active beat container to vertically center the content better, especially for Beat 1 which has no collapsed cards above it.

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

**Line 181** — Change the active beat container padding from `pt-8` to `pt-24`:
- From: `className="flex-1 flex items-start justify-center px-8 pt-8 overflow-y-auto"`
- To: `className="flex-1 flex items-start justify-center px-8 pt-24 overflow-y-auto"`

This adds more top spacing to vertically center the content, making Beat 1 appear in a more central location on the screen while still preserving the `items-start` alignment that prevents content from shifting down as beats accumulate above.

