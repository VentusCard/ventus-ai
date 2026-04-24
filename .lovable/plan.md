## Issue

The phone mockup in the executive demo (`/demo`) renders the literal text `{firstname}` in two spots — the top status header ("TCBY Bank · {firstname}") and the Membership tab welcome line / advisor quote ("Welcome, {firstname}", "Let's plan together, {firstname}."). Both components already receive the `customer` prop, so we can resolve the actual first name from `customer.profile.name`.

## Fix

### 1. `src/components/exec-demo/ExecDemoPhoneView.tsx`

Derive the first name from `customer.profile.name` and inject it into the header (line 150).

```tsx
// near top of component body
const firstName = (customer.profile?.name ?? "").split(" ")[0] || "there";

// line 150
<span className="text-[10px] font-semibold text-slate-600 tracking-wide leading-tight">
  TCBY Bank · {firstName}
</span>
```

### 2. `src/components/exec-demo/RelationshipPhoneView.tsx`

Replace the placeholder constant on line 57 with the real first name.

```tsx
const firstName = (customer.profile?.name ?? "").split(" ")[0] || "there";
```

The existing `{firstName}` interpolations on lines 69 and 134 will then render the real name automatically.

### Out of scope

`ProductRecommendationPhoneView` and `GeneratedOffersPhoneView` already derive `firstName` correctly from `customerName` — no change needed.