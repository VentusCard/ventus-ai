

## Group Section Nodes with Border Containers

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

Replace the current rendering of section headers + individual absolutely-positioned node buttons with a single absolutely-positioned **container `div`** per section that:

1. Has a light border (`border border-slate-200`), rounded corners (`rounded-xl`), and subtle background (`bg-slate-50/50`)
2. Contains the section title as a small uppercase label at the top (inside the container, not floating separately)
3. Contains both node buttons stacked vertically with a small gap (`gap-2`), rendered as **relative** elements inside the container (no longer absolutely positioned individually)
4. The container itself is absolutely positioned using the same `colRight` x-coordinate and `sectionTop` y-coordinate

**Layout change:**
- Remove individual absolute positioning from each node button — they become flex children inside the section container
- The section container is `absolute`, positioned at `left: colRight - 58`, `top: sectionTop + 4`, with fixed width ~200px
- Inside: `flex flex-col gap-2 p-3 pt-2` with the section label as the first child
- SVG connector lines target the vertical center of each node button — compute `nodeY` from the container's top + offset for each button within the flex layout (approximately `sectionTop + 4 + 28 + nodeIdx * 48` for tight spacing)

This is a single-file change to `DemoNetworkDiagram.tsx`, restructuring lines 227–303.

