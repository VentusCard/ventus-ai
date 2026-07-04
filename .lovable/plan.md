## Plan: Reshape System Tab Source Inputs

### Goal

Replace the current source-inputs panel (left column of the network canvas on the **System** tab) with six data-source categories while keeping the existing provider-card format.

### What changes

**File:** `src/components/tepilot/insights/CapabilitiesView.tsx`

1. **Replace `SOURCE_GROUPS**`
  Update the constant array so each of the six requested items becomes its own provider card, preserving the `SourceGroup` structure (provider name, sublabel, icon, inputs). Map existing input chips under the new categories:
  - **KYC** → KYC & Profile
  - **Transactions** → Card Transactions, ACH & Wires, Zelle
  - **Product Holdings** → Cards, Loans, Mortagages  
  - **Digital Banking** → Digital Telemetry
  - **External Intelligence** → Credit File, Wealth Data, Property Data, Demographics Data
  - **Bank Context** → Bank Products, Prices, Promotions and Campagins 
2. **Update the dynamic `sourceGroups` array inside `CapabilitiesView**`
  Remove the manual append of the "Bank Product" group since it will already live inside the reshaped `SOURCE_GROUPS`.
3. **Preserve everything else**
  The signals, teams, products, destinations, and network-canvas layout remain untouched.

### What stays the same

- Card styling, expand/collapse behavior, icons, and non-FCRA badges
- The network wires, center "Behavioral Intelligence Core" block, and right-side destinations column
- All other tabs and pages