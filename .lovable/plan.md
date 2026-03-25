

## Fix: Transaction Preview Broken for Custom Customers

### Root Cause

Two issues in the `buildCustomerPrompt` output format:

1. **CSV headers don't match parser expectations** — The prompt asks for `date,merchant_name,amount,mcc,merchant_zip` but the parser (`parsePastedText`) works best with the standard headers it's designed for: `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source`. Missing `transaction_id` is auto-generated, but `merchant_zip` mapping is fragile and `mcc` competes with `category` in column detection.

2. **Commas in amounts** — LLMs output `1,142.90` which breaks the simple `line.split(",")` parser. The session replay shows this happening with amounts like `$1,142.90` and `$1,950.00`.

### Fix — `src/lib/demoData.ts`

Update `buildCustomerPrompt` to:
- Use the exact CSV headers the parser expects: `transaction_id,merchant_name,description,mcc,amount,date,zip_code,source`
- Explicitly instruct "never use commas in numeric amounts"
- Number transaction rows so `transaction_id` is populated

This is a single change to the prompt template (lines 110-136).

### Single file change
`src/lib/demoData.ts` — update the prompt string in `buildCustomerPrompt`

