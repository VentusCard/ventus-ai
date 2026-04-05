

## Move Persona Line Above Pills

### Problem
The evolving persona description (e.g., "Golf & Wellness Enthusiast") currently renders **below** the signal pill rows. It should appear **above** them.

### Change

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Move the "Evolving persona description" block (lines 113-124) to **before** the "Signal rows" block (line 103)
- The description will render at the top of the persona card, followed by the pillar pill rows below it

### Files
1. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — reorder: persona description above signal rows

