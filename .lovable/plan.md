

## Plan: Expand chat panel by default

### Change
In `src/components/tepilot/insights/AnalyticsContainer.tsx`, line 96, change the initial state of `chatOpen` from `false` to `true`:

```ts
const [chatOpen, setChatOpen] = useState(true);
```

Single character change. The chat panel will now be open by default on every tab (except the Ventus AI tab which already has its own view).

