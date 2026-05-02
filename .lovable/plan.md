## Make iPad inner content slightly bigger

Scale up everything inside the iPad bezel (status bar, content area, bottom tab bar) by ~10% using a single CSS `zoom` wrapper. The bezel itself stays the same size — only the contents grow.

### Change

In `src/components/exec-demo/ExecDemoPhoneView.tsx`, wrap the three inner sections (status bar, content area, tab bar) in a single flex container with `style={{ zoom: 1.1 }}`. The wrapper inherits `flex-1 min-h-0 flex flex-col` so layout still fills the bezel.

```tsx
<div className="phone-mockup-frame ... border-slate-600 ... flex flex-col w-full h-full">
  {/* Camera dot stays outside zoom */}
  <div className="flex justify-center pt-1.5 pb-0.5 ...">
    <div className="w-2 h-2 rounded-full bg-slate-300" />
  </div>

  {/* Zoomed inner stack */}
  <div className="flex-1 min-h-0 flex flex-col" style={{ zoom: 1.1 }}>
    {/* status bar */}
    {/* content (rewards / membership / AI chat) */}
    {/* bottom tab bar */}
  </div>
</div>
```

### Why zoom (not transform: scale)

`transform: scale()` would visually shrink the layout box and leave empty space. `zoom` actually reflows children at the larger size, so the content fills the bezel naturally and scrolling still works inside the AI chat and rewards panes.

### Files
- `src/components/exec-demo/ExecDemoPhoneView.tsx`
