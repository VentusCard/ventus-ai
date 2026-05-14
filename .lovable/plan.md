## Stop auto-scroll from yanking the analytics page mid-load

`VentusAIWelcomeView` runs `messagesEndRef.current?.scrollIntoView(...)` in a `useEffect` that fires on every change to `messages` — including the initial render. Because the ref sits well below the gradient hero, the browser scrolls the whole window to bring it into view, which is why `/bank-analytics` opens halfway down. `VentusAIChatPanel` has the same pattern.

### Change

In **`src/components/tepilot/insights/VentusAIWelcomeView.tsx`** (line 135) and **`src/components/tepilot/insights/VentusAIChatPanel.tsx`** (line 94):

- Skip the scroll on the first render / when `messages.length === 0`.
- Use `block: "nearest"` so it only scrolls the nearest scroll container (the chat list), not the page.

```ts
useEffect(() => {
  if (messages.length === 0) return;
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}, [messages]);
```

This keeps the chat-follows-new-message behavior intact while letting the page open at the top.
