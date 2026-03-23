

## Remove Icon & Make Engine Card Content-Fitted

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### Changes

1. **Remove Layers icon** (line 261): Delete the `<Layers>` icon from the header. Keep just the text "Advanced Enrichment".

2. **Reduce ENGINE_MIN_HEIGHT** (line 82): Change `BASE_ENGINE_MIN_HEIGHT` from `200` to `140` so the card hugs its content instead of being a tall square with excess whitespace.

3. **Tighten padding** (line 250): Remove `justify-center` from the button class (which vertically centers content in excess space) and add compact padding like `py-3 px-2` instead. Keep `items-center` for horizontal centering.

4. **Reduce header margin** (line 260): Change `mb-3` to `mb-2` on the title div.

### Result
- No icon before "Advanced Enrichment"
- Card shrinks vertically to fit its content (title + 3 capability rows) with minimal padding

