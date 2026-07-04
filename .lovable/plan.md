# Enrich System tab expanded context

File: `src/components/tepilot/insights/CapabilitiesView.tsx` (rewrite `sourceGroups` array inside `CapabilitiesView`, ~lines 602–650)

Each card's collapsed header stays the same. Only the expanded list (`inputs`) changes. Icons come from existing `lucide-react` imports (add any missing ones: `ShieldCheck`, `FileCheck`, `MapPin`, `Wallet`, `Briefcase`, `Landmark`, `Receipt`, `FileText`, `MousePointerClick`, `Bell`, `Search`, `Car`, `Sparkles`).

### KYC — Identity & compliance

- Name, DOB, SSN (`UserCircle`)
- Address & contact (`MapPin`)
- Document verification — ID / passport (`FileCheck`)
- Sanctions, PEP & watchlists (`ShieldCheck`)
- Employer & occupation (`Briefcase`)

### Transactions — Card, ACH, wire & digital payments

- Card auth & posted (`CreditCard`)
- ACH debit / credit (`ArrowLeftRight`)
- Wires in / out (`Landmark`)
- Zelle (`Send`)
- RTP / FedNow (`Zap`) — reuse existing `Zap` if imported, else `Send`
- Bill pay & checks (`Receipt`)

### Product Holdings — Customer portfolio

- Checking & savings (`Wallet`)
- Credit & debit cards (`CreditCard`)
- Loans & mortgage (`Home`)
- Investments & brokerage (`PiggyBank`)
- Statements & balances (`FileText`)

### Digital Banking — App & web telemetry

- App sessions & screens (`Smartphone`)
- Web sessions & pages (`Gauge`)
- Search & clicks (`Search` or `MousePointerClick`)
- Push & in-app notifications (`Bell`)
- Feature usage & funnels (`Layers`)

### External Intelligence — Credit bureau & consumer data

- Credit File (`Gauge`) — FCRA
- Wealth Data (`PiggyBank`) — non-FCRA
- Property Data (`Home`) — non-FCRA
- Demographics Data (`Users`) — non-FCRA
- Auto & VIN (`Car`) — non-FCRA
- Employment & income (`Briefcase`) — non-FCRA
- Life events (`Sparkles`) — non-FCRA
- Digital identity & device (`ShieldCheck`) — non-FCRA

### Bank Context — Products, pricing & campaigns

- Products & Pricies (find icon)
- Promotions and Incentives (find icon)

Unchanged — keeps `BANK_PRODUCT_CATEGORIES` and "Open Products tab" link.

### Notes

- Card layout, expand/collapse, non-FCRA badge styling, network wires, and every other tab remain untouched.
- Header count string (`{totalSourceInputs} inputs across {sourceGroups.length} providers`) will auto-update.
- Verify with `tsgo` after edit.