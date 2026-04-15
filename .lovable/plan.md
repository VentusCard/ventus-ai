

## Toggle Panels with Smooth Animation

### What changes

In `src/pages/ExecDemoPage.tsx`, lines 754–833:

1. **Derive visibility boolean**: `const showPhone = activeTab === "rewards" || activeTab === "product" || activeTab === "relationship"` — true when any "Next-Offer" tab is active.

2. **Replace fixed 3-column grid** with a dynamic layout:
   - Before Next-Offer: `grid-cols-[400px_1fr]` — transaction panel + intel panel (phone hidden)
   - After Next-Offer: `grid-cols-[1fr_360px]` — intel panel + phone mockup (transactions hidden)
   - Add `transition-all duration-500 ease-in-out` on the grid container for smooth resize

3. **Conditionally render columns**:
   - Col 1 (transactions): render only when `!showPhone`
   - Col 3 (phone): render only when `showPhone`
   - Wrap each in a `<div>` with opacity/translate transitions for a fade+slide entrance:
     - Transactions: `opacity transition-opacity duration-500` (fade out when hiding)
     - Phone: `animate-fade-in` on mount (slide up + fade in)

4. **Add CSS transition classes** in the existing `src/styles/animations.css` — a `panel-enter` keyframe for smooth slide-in from the right for the phone panel:
   ```css
   @keyframes panel-slide-in {
     from { opacity: 0; transform: translateX(20px); }
     to { opacity: 1; transform: translateX(0); }
   }
   .animate-panel-slide-in {
     animation: panel-slide-in 0.4s ease-out forwards;
   }
   ```

### Files changed
- `src/pages/ExecDemoPage.tsx` — grid layout logic (lines 754–833)
- `src/styles/animations.css` — add `panel-slide-in` keyframe

