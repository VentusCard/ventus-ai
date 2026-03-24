

## Plan: Remove Grey Subheader Text from Demo Beats

The grey subtitle paragraphs (`color: #64748B`) below the bold black headers on each beat of the demo opener will be removed. Only the bold black header text will remain.

### File: `src/components/demo/DemoPasswordGate.tsx`

Remove the following `<p>` elements:

1. **Beat 1** (line 314-317): Remove the paragraph "Your customers see irrelevant offers..."
2. **Beat 2** (line 328-332): Remove the paragraph "Every bank runs on Merchant Category Codes..."
3. **Beat 3** (line 344-347): Remove the paragraph "A customer spends $120 on a ticket..."
4. **Beat 4** (line 412-414): Remove the paragraph "Five transactions across five different MCC codes..."
5. **Beat 5** (line 485-487): Remove the paragraph "Combine the behavioral pattern with the customer's demographics..."
6. **Beat 6** (lines 590-594): Remove the paragraph that toggles between "Demographics and transaction data..." / "Dynamic Personas & Behavioral Insights..."

All six beats will show only the bold black `<h1>`/`<h2>` header. No other elements are affected.

