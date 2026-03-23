

## Add Logo + One-Liner When Panel Collapsed; Reposition Buttons

**File: `src/pages/DemoPage.tsx`**

### Changes

**1. Logo + one-liner (top-left, only when panel collapsed)**
When `panelCollapsed` is true, render the Ventus logo and the official one-liner ("One AI-Native layer that enables personalized banking across functions.") in the top-left area. Import `ventusLogo` from `@/assets/ventus-logo-blue.png`. Style: logo ~h-6, one-liner below in small slate-500 text, max-width constrained.

**2. Move "Show Panel" button down**
Relocate from `top-4 left-4` to `bottom-4 left-4` — sits in the bottom-left corner instead of top-left (which is now occupied by the logo).

**3. Move "Exit Demo" below "Next Step"**
Remove the fixed top-right "Exit Demo" button. Instead, place it in the bottom-right cluster:
- When no overlay is active: stack "Next Step →" and "✕ Exit Demo" vertically (or side by side) in `bottom-4 right-4`
- When overlay is active: keep the prev/next nav as-is, with "Exit Demo" alongside

This groups all action buttons in the bottom bar and frees the top area for branding.

### Layout Summary

```text
┌─────────────────────────────────────────┐
│ [Logo]                                  │
│  One AI-Native layer that enables...    │
│                                         │
│            (diagram)                    │
│                                         │
│ [Show Panel]          [Next Step][Exit] │
└─────────────────────────────────────────┘
```

