

## Dynamic Border Style for Consumer Cards

### Change — `src/components/demo/DemoNetworkDiagram.tsx`

In the grouping border section (lines 443–464), compute whether all 3 consumer nodes are ready:

```ts
const allConsumerReady = ["engagement", "rewards", "wealth"]
  .every(id => nodeReadiness[id] === "ready");
```

Then conditionally apply:
- **All ready**: `border-solid border-slate-300 bg-white`
- **Not all ready**: `border-dashed border-slate-200` (current)

Single change in one file, ~3 lines modified.

