

## Fix Parallel Layout Between Mission & Learn More

### Problem
The two sections look asymmetric: "Mission" uses a small uppercase label while "Learn More" uses a large heading. Content isn't vertically centered consistently across both panels.

### Changes — `src/components/ContactFormDialog.tsx`

**Make both section headers identical style:**
- Both "Mission" and "Learn More" use the same: `text-[13px] font-bold uppercase tracking-widest text-slate-500 mb-10`
- Remove the current `text-2xl font-bold text-slate-900` from "Learn More"

**Center content in both panels:**
- Both panels: `flex flex-col items-center justify-center text-center`
- Same padding on both: `p-10 md:p-14`
- Right panel gets the same `bg-white` with matching structure
- Left panel content blocks centered with `text-center`

**Right panel buttons centered:**
- Buttons stay full-width but the container is centered within the panel
- Add `w-full max-w-sm mx-auto` to the button group so they don't stretch edge-to-edge

### Result
Both panels mirror each other: identical small uppercase section headers at top, content vertically and horizontally centered, creating visual symmetry.

