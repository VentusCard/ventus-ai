# Lifestyle Category v2

## Objective

Lifestyle category should describe the customer behavior signal that a bank can use downstream. It should not be a loose restatement of merchant category. The same merchant category can map to different lifestyle categories when the transaction context changes, but the evaluator should only accept secondary labels when the context makes that ambiguity legitimate.

## Current Finding

After Golden Expectation v2, the largest remaining benchmark failures are lifestyle boundaries rather than merchant cleanup. The most common conflicts are:

- Financial & Aspirational vs Miscellaneous & Unclassified
- Miscellaneous & Unclassified vs Travel & Exploration
- Technology & Digital Life vs Financial & Aspirational
- Entertainment & Culture vs Technology & Digital Life
- Home & Living vs family-like labels

These should be handled with explicit decision rules, not broad global aliases.

Update: [Lifestyle Taxonomy v3](./lifestyle-taxonomy-v3.md) promotes `Family & Community` into the Plaid benchmark prompt because that category already exists in the production classifier and multi-rail fixtures. It keeps routine transportation inside `Home & Living / Local Commuting` rather than creating a new top-level `Transportation` category.

## Decision Rules

### Financial & Aspirational

Use for money movement, income, payroll, loan repayment, savings, investment movement, credit card payments, and other financial-account behavior.

Default here:

- ACH payroll and income
- Zelle, Venmo, Cash App, transfers, wires, savings movement
- loan and credit repayment
- bank fees and cash movement when no stronger lifestyle intent exists

Tie-breakers:

- P2P with no purpose stays Financial & Aspirational.
- P2P with explicit meal, travel, rent, medical, childcare, or household purpose can take the stronger lifestyle category while merchant_category remains Transfers.
- Business or finance software can remain Technology & Digital Life unless the product signal is explicitly financial workflow.

### Travel & Exploration

Use for trip behavior, lodging, flights, travel booking, airport/trip clusters, foreign transaction fees, and travel-specific services.

Do not use Travel & Exploration for isolated gas, parking, or rideshare unless there is trip context. Routine local transportation should remain Miscellaneous & Unclassified unless a future Transportation lifestyle category is added.

### Technology & Digital Life

Use for software, digital subscriptions, app stores, consumer electronics, cloud/SaaS, business software, gaming platforms, and digital utility.

Tie-breakers:

- Apple.com billing can be Entertainment & Culture or Technology & Digital Life depending on whether it is interpreted as media/gaming or app/software utility.
- Apple Store / consumer electronics can be Technology & Digital Life even when the raw partner category is general merchandise.
- QuickBooks and business SaaS should usually be Technology & Digital Life; Financial & Aspirational is secondary only if the scoring question is explicitly about financial admin behavior.

### Entertainment & Culture

Use for media, streaming, gaming, movies, cultural events, and leisure content.

Tie-breakers:

- Steam can be Entertainment & Culture or Technology & Digital Life because it is both gaming and a digital platform.
- Apple.com billing can be Entertainment & Culture when the partner category or context points to TV, movies, media, games, or content subscriptions.

### Home & Living

Use for rent, utilities, household services, home improvement, moving, childcare/new-family household signals, furniture, and household setup.

Tie-breakers:

- Childcare and baby retail map to Home & Living in the current taxonomy because there is no dedicated Family lifestyle category in the benchmark prompt.
- If a future Family & Community lifestyle category is promoted into the benchmark prompt, childcare and baby retail should likely move there.

### Health & Wellness

Use for medical, pharmacy, dental, insurance/healthcare, fitness, and wellness services.

Tie-breakers:

- Healthy restaurants such as Sweetgreen remain Food & Dining unless the transaction is explicitly medical, supplement, fitness, or wellness service.
- Pharmacy descriptors should be Health & Wellness even when the merchant is a mixed retailer.

### Food & Dining

Use for restaurants, coffee, fast casual, groceries, food delivery, dining halls, and explicit meal reimbursements.

Tie-breakers:

- Cash App / Venmo with explicit meal language may be Food & Dining as lifestyle but should remain Transfers for merchant_category.
- Grocery can be Food & Dining unless the transaction is clearly pharmacy/medical or general merchandise.

### Miscellaneous & Unclassified

Use as a fallback for broad retail, unclear general merchandise, local transportation with no trip signal, or transactions without a strong lifestyle intent.

Do not use this as a default when a stronger signal exists.

## Evaluator Policy

Lifestyle v2 should stay conservative:

- Use transaction-level accepted_lifestyle_categories for known ambiguous benchmark rows.
- Do not create broad global lifestyle equivalence groups, because this can hide real downstream business differences.
- Keep unresolved boundary pairs in the failure audit for human review.
- Prefer adding a new taxonomy category over overloading Miscellaneous if repeated real data shows a missing concept such as Transportation or Family.

## Benchmark Updates

The current benchmark generator now adds secondary accepted lifestyle labels only for clear context:

- Cash App with meal memo: Financial & Aspirational plus Food & Dining
- Apple.com billing / Steam-like digital entertainment: Entertainment & Culture plus Technology & Digital Life
- QuickBooks / financial SaaS: Technology & Digital Life plus Financial & Aspirational
- Apple Store electronics: Miscellaneous & Unclassified plus Home & Living and Technology & Digital Life

Routine gas, parking, and rideshare are not automatically accepted as Travel & Exploration.
