## Problem
The Ventus AI chat panel on `/bankdemo` is expanded by default (`chatOpen = true`), which takes up horizontal space and distracts from the main dashboard content.

## Fix
In `src/components/tepilot/insights/AnalyticsContainer.tsx`, change the initial state:

```tsx
const [chatOpen, setChatOpen] = useState(false);
```

This keeps the chat panel collapsed on load while preserving the existing toggle button behavior so users can still open it manually.