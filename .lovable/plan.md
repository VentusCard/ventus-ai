

# Deep Dive Rewrite: Sequential Row Animation + Cycling Personas

## Current Problem
The current animation tries to use CSS `animation-delay` to stagger rows, but they all appear together on initial load. The persona section is static and never changes.

## New Animation Behavior

### Transaction Rows -- Sequential Reveal
Each row will appear one at a time with a clear pause between them:
1. Row 1 slides in (raw data visible), then after 300ms its derived columns (Merchant, Category, Sub-Category) fade in
2. 500ms pause
3. Row 2 slides in, then derived columns fade in
4. Repeat for rows 3, 4, 5
5. After all 5 rows are visible, hold for 1.5s
6. Persona section fades in / updates
7. Hold for 2s, then fade everything out and restart with a different dataset

### Persona Section -- Cycles Through 3 Different Personas
Each loop iteration shows a different persona matching a different transaction set:

**Set A** (current): Urban Professional -- Whole Foods, Uber Eats, Amazon, Blue Bottle, Netflix
**Set B**: Frequent Traveler -- Delta Airlines, Marriott, Hertz, Global Entry, Uber
**Set C**: Young Family -- Target, Pediatrics Co-Pay, Disney+, Costco, Kumon

### Animation Timeline Per Cycle (~8s total)
```text
0.0s  -- Row 1 slides in
0.3s  -- Row 1 derived columns fade in
0.8s  -- Row 2 slides in
1.1s  -- Row 2 derived columns fade in
1.6s  -- Row 3 slides in
1.9s  -- Row 3 derived columns fade in
2.4s  -- Row 4 slides in
2.7s  -- Row 4 derived columns fade in
3.2s  -- Row 5 slides in
3.5s  -- Row 5 derived columns fade in
4.0s  -- Persona panel fades in
6.0s  -- Everything fades out
6.5s  -- Reset, switch to next dataset
7.0s  -- Next cycle begins
```

## Technical Approach

### Script-Driven Animation (no CSS animation-delay)
Instead of relying on CSS `animation-delay` properties, the script will:
- Start all rows with `opacity: 0; transform: translateY(-12px)`
- Use `setTimeout` chains to reveal each row one at a time via inline style transitions
- Use CSS `transition` property for smooth opacity/transform changes
- Derived cells get their own delayed transition per row

### Data Structure in Script
The script will contain 3 arrays of transaction data and 3 persona objects. On each cycle, it:
1. Writes the transaction rows into the table via `innerHTML`
2. Writes the persona panel content
3. Runs the sequential reveal animation
4. After the hold period, fades out and schedules the next cycle

### CSS Changes
- Remove `animation` and `animation-delay` from `.data-row` and `.derived` classes
- Add `transition: opacity 0.4s ease, transform 0.4s ease` to rows and derived cells
- Add `.persona-panel` transition for fade in/out
- Rows and persona start hidden (`opacity: 0`)

## Files Changed
- **Modified**: `src/components/technology/demos/enrichment-demo.ts` -- complete rewrite of HTML structure (table body becomes empty, populated by script), CSS (transition-based instead of animation-based), and script (sequential reveal + data cycling)

No changes to `AnimatedDemo.tsx` -- the ref-based script execution approach works correctly.

