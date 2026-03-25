

## Add Team Labels to Pillar Row Headers

### Change
Update each pillar row's question label from a single line to two rows:
- **Row 1**: Pillar icon + Team name (e.g., "Analytics Team", "Reward Team", "Growth and Wealth Team")
- **Row 2**: Current question text

### Data Change
Add a `team` field to each `PillarRow` in the `PILLAR_ROWS` array:
- profiling → "Analytics Team"
- predictive → "Reward Team"  
- phase → "Growth and Wealth Team"

### Rendering Change
Update the question label `div` (around line 344-357) to render two lines instead of one:
- Line 1: icon + team name (smaller, muted style)
- Line 2: question subtitle (current styling)

Increase `QUESTION_LABEL_HEIGHT` constant to accommodate two lines.

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx`

