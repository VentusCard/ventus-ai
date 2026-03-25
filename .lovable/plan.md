

## Fix: Match input connector to the same style as all other diagram connectors

The current "ready" state for the customer→engine connector renders oversized dots (r=4) and an overly thick line (strokeWidth=3), which looks completely different from every other connector in the diagram. The other connectors (engine→bank, bank→consumer, consumer→impact) all use the same consistent pattern:

```
strokeWidth: 2.5 when ready, 1.5 when not
opacity: 0.7 when ready, 0.2 when not  
strokeDasharray: "none" when ready, "6 4" when not
```

### Changes in `src/components/demo/DemoNetworkDiagram.tsx`

Replace the entire input connector block (lines 190-210) with a single consistent treatment that matches the other connectors:

- **Remove** the conditional `{!isReady && ...}` / `{isReady && ...}` split
- **Remove** the two endpoint circles entirely
- **Use one `<path>`** with the same ready/idle styling as lines 228-229:
  - `strokeWidth={isReady ? 2.5 : 1.5}`
  - `opacity={isReady ? 0.7 : 0.2}`  
  - `strokeDasharray={isReady ? "none" : "6 4"}`
  - `stroke="url(#lineGradSolid)"` when ready, `"url(#lineGrad)"` when not
- **Keep** the processing particle dot as-is (lines 196-199)
- **Remove** the 4px offset on `txRight`/`engineLeft` — revert to `txRight = txCenterX + TX_CARD_WIDTH / 2` and `engineLeft = engineCenterX - ENGINE_WIDTH / 2` to match how other connectors anchor flush to card edges

This makes the input connector identical in style to every other connector in the diagram.

