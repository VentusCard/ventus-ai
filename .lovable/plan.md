## Uniform tablet mockup width across Next-* tabs

In `src/pages/ExecDemoPage.tsx` line 1615, the phone/tablet column width is currently:

```ts
const expandedW = isRelTab ? 520 : 560;
```

This makes the Next-Conversation (relationship) mockup 40px narrower than Next-Offer and Next-Product.

Change to a single constant width for all three tabs:

```ts
const expandedW = 560;
```

Remove the now-unused `isRelTab` variable if nothing else references it in this scope.
