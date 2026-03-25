

## Redesign Custom Input: One-Shot Copy-Paste with 1 Life Event

### Concept
Single prompt → single paste. User describes a persona, copies a tailored prompt into ChatGPT/Claude, pastes the full output back, loads in one click. The prompt instructs the LLM to embed **1 realistic life-event transaction cluster** matching the persona.

### Output Format the LLM Returns
```
=== PROFILE ===
name: Sarah Chen
age: 45
occupation: VP of Engineering
family: Married with Kids
income: $150,000
segment: Premier
industry: Technology
zip: 94102

=== TRANSACTIONS ===
date,merchant_name,amount,mcc,merchant_zip
2026-01-15,Whole Foods,87.50,5411,94102
...
```

### UX — `DemoCustomerPanel.tsx`
When "Custom" is selected from the dropdown:
1. **Persona textarea** — short description (e.g. "55-year-old executive, married, kids in college")
2. **Copy Prompt** button — generates dynamic prompt incorporating the persona, instructs LLM to include **1 life-event cluster**
3. **Paste Output** textarea — single field for the combined PROFILE + TRANSACTIONS block
4. **Load Customer** button

### Data — `demoData.ts`
- Expand `CustomDemographics` with `incomeLevel`, `segment`, `industry`
- Add `parseUnifiedOutput(text)` — splits on `=== PROFILE ===` / `=== TRANSACTIONS ===`, extracts demographics + CSV
- Update `buildCustomDemoCustomer` to use expanded fields

### Files
| File | Change |
|------|--------|
| `src/lib/demoData.ts` | Add parser, expand demographics type, update builder |
| `src/components/demo/DemoCustomerPanel.tsx` | New prompt-based custom UX, dynamic prompt with 1 life event |

