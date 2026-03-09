

## Plan Update: 5 Output Nodes Instead of 3

The only change to the previously approved plan is expanding from 3 to 5 clickable output nodes on the network diagram, matching all platform capabilities.

### Network Diagram Output Nodes (5)

```text
[Raw Txns A] ──┐                          ┌── [Bank-Wide Analytics]
               ├── [Ventus AI Engine] ────┼── [Consumer Rewards]
[Raw Txns B] ──┘                          ├── [Customer Engagement]
                                          ├── [Travel Experience]
                                          └── [Wealth Management]
```

### Detail Views Per Node

| Node | Side-by-Side View | Data Source |
|------|-------------------|------------|
| **Bank-Wide Analytics** | Portfolio-level metrics comparison (spend distribution, pillar breakdown) per customer | Reuse pillar aggregation logic |
| **Consumer Rewards** | Personalized deal cards per customer | Reuse `VentusSmartRewards` data |
| **Customer Engagement** | Phone mockups with personalized app UI | Reuse `VentusEngagementDemo` styling |
| **Travel Experience** | Detected trip cards per customer | Reuse travel detection data |
| **Wealth Management** | Life event alert cards per customer | Reuse `LifeEventAlertCard` styling |

### Additional Files (vs previous plan)

- `src/components/demo/DemoAnalyticsView.tsx` — Analytics comparison
- `src/components/demo/DemoTravelView.tsx` — Travel comparison

Everything else from the previously approved plan remains unchanged (page structure, routing, customer panel, dark theme, animated SVG lines).

