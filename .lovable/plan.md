# Add Life-Event-Driven Flows (Consumer Products Only)

Add the missing life-event flows that map to a concrete consumer financial product the bank actually sells. Skip events already covered by an existing flow (e.g. newborn→529, RSU vest→wealth, lease end→auto loan, pre-retirement→annuity/LTC, 401(k) job-change→IRA, inheritance→wealth/trust).

## New flows to add

| # | id | Name | Category | Triggering life event |
|---|----|------|----------|------------------------|
| 1 | `wedding-loan` | Wedding Personal Loan | Lending | Engagement → wedding cycle |
| 2 | `solo-restart-checking` | Solo Restart Checking | Deposits | Divorce / separation |
| 3 | `inherited-ira` | Inherited IRA | Wealth | Beneficiary distribution |
| 4 | `second-home-mortgage` | Second Home Mortgage | Lending | Vacation-home purchase |
| 5 | `student-loan-refi` | Student Loan Refinance | Lending | Post-grad income step-up |
| 6 | `hsa` | Health Savings Account | Deposits | High-deductible health plan |
| 7 | `donor-advised-fund` | Donor-Advised Fund | Wealth | Charitable giving uptick |
| 8 | `personal-line-of-credit` | Personal Line of Credit | Lending | Income disruption / gap |
| 9 | `global-account` | Multi-Currency Global Account | Deposits | Expat / international move |
| 10 | `homeowners-insurance` | Homeowners Insurance | Insurance | New home purchase |
| 11 | `umbrella-insurance` | Umbrella Insurance | Insurance | Multi-asset household, teen driver |
| 12 | `move-financing` | Moving & Relocation Loan | Lending | Cross-state move |

## Per-flow signals (consumer-account observable)
Each gets 3 `FlowSignal`s mixing `life-event` and `behavioral`, drawn from personal-account activity only (no business-account assumptions). Examples:
- **Wedding loan**: engagement ring spend cluster, venue/caterer deposits, save-the-date printing
- **Solo restart checking**: joint→single ACH shift, recurring family-law attorney ACH, address change
- **Inherited IRA**: estate-distribution inflow, beneficiary form interactions, deceased-spouse signal
- **Second home mortgage**: recurring vacation-rental spend at same locale, multi-state property tax, high HHI
- **Student loan refi**: recurring federal/private servicer ACH + payroll step-up post-graduation
- **HSA**: HDHP premium pattern, recurring pharmacy + specialist copays, FSA cliff timing
- **Donor-advised fund**: Q4 charitable spike, recurring nonprofit donations, high investable assets
- **PLOC**: payroll gap or step-down, rising card utilization, healthy savings ratio
- **Global account**: international payroll inflow, foreign-currency spend, cross-border wires
- **Homeowners insurance**: new mortgage on file + no insurer ACH detected
- **Umbrella**: multi-property tax footprint, teen-driver insurance add, wealth tier
- **Move financing**: van-rental / moving-services spend, multi-state address change, deposit on new lease

## Microsegments
Generate `FLOW_MICROSEGMENTS` entries for all 12 new flows using the same script and tone rules already in place (≤40-word body, no surveillance phrasing, bright/opportunity-framed, `Hi {{first_name}},` opener).

## Files touched
- `src/lib/productAutomatedFlows.ts` — add 12 entries (icons from lucide-react, no UI changes)
- `src/lib/productMicrosegments.ts` — append 12 new keys via regen script

No component, route, schema, or styling changes. Brings catalog from 32 → 44 flows.
