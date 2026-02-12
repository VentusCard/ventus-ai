

# Fix: Enrichment Demo Animation Not Running

## Problem
React's `dangerouslySetInnerHTML` inserts HTML but browsers do NOT execute `<script>` tags injected this way. The looping animation script is present in the HTML string but never runs.

## Solution
Update the `AnimatedDemo` component to use a `useEffect` + `useRef` approach that:
1. Inserts the HTML into a container via `ref.current.innerHTML`
2. Manually finds any `<script>` tags in the inserted HTML, creates new `<script>` elements, and appends them to the DOM so the browser actually executes them
3. Cleans up on unmount (clears the interval)

## Technical Details

### File Changed
**`src/components/technology/AnimatedDemo.tsx`** -- the only file that needs updating.

### Updated Logic
- Add `useRef` to get a reference to the container div
- Add `useEffect` that:
  1. Sets `innerHTML` on the ref
  2. Queries all `<script>` elements inside the injected HTML
  3. For each, creates a new `script` element, copies its content, and appends it to the container (this triggers browser execution)
  4. Returns a cleanup function that clears any intervals set by the script

No changes needed to `enrichment-demo.ts` -- the HTML and script content stay exactly the same.

