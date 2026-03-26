

## Fix: "Next Step" Button Does Nothing

### Root cause
Line 161-167 sets `contactOpen` to `true` on click, but the `<ContactFormDialog>` component is never rendered in the JSX. The import exists (line 11), the state exists (line 18), but the actual component is missing from the return.

### Fix — `src/pages/DemoPage.tsx`

Add the dialog component just before the closing `</div>` of the root container (before line 184):

```tsx
<ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
```

One line addition.

