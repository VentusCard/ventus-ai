

## Fix: Reset scroll to top when switching tabs

### Problem
When clicking the "Ventus AI" tab (or any tab), the right content panel retains the scroll position from the previous tab, making it appear scrolled down.

### Fix (single file: `src/components/tepilot/insights/AnalyticsContainer.tsx`)

1. Add a `useRef` on the content `<div>` (line 201)
2. Add a `useEffect` that watches `activeTab` — when it changes, reset `contentRef.current.scrollTop = 0`

### Technical detail
- Add `useRef` to the React imports
- Create `const contentRef = useRef<HTMLDivElement>(null)`
- Add `useEffect(() => { contentRef.current?.scrollTo(0, 0); }, [activeTab])`
- Attach `ref={contentRef}` to the content div on line 201

