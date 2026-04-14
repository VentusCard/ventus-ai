

## Redesign "Synthesize Persona" → "Behavioral Intelligence: Ready"

**Goal**: Replace the amber/gold "✦ Synthesize Persona" button with a high-tech styled "Behavioral Intelligence: Ready" button.

### Design
- **Color scheme**: Shift from amber/gold to a cool blue/cyan tech palette (#2563EB / #06b6d4)
- **Icon**: Replace `Sparkles` with a tech-oriented icon like `Cpu`, `Scan`, or `Zap` from lucide-react
- **Text**: "Behavioral Intelligence: Ready" with a subtle pulsing glow animation
- **Style**: Dark background (deep navy/slate) with a cyan/blue border glow, scanline or pulse effect for a "system ready" aesthetic
- **Animation**: Replace `synthesize-glow` with a cooler tech pulse — alternating border glow in blue/cyan tones

### File Change
**`src/components/exec-demo/ExecDemoIntelPanel.tsx`** (lines 263-278):
- Update the button text to "Behavioral Intelligence: Ready"
- Change icon from `Sparkles` to `Cpu` or `Zap`
- Restyle with dark bg (`rgba(15,23,42,.9)`), cyan border glow, white/cyan text
- Update the `synthesize-glow` keyframe to use blue/cyan colors
- Add a subtle scanning line or pulse dot for high-tech feel

