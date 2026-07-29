import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Public demo signals — the same reference "external intelligence" the /bankdemo
// experience shows. Data is illustrative sample content, not real customer data.
const SIGNALS = [
  {
    id: "auto-loan-renewal",
    bucket: "life_event",
    label: "Car Loan Renewal in ~2 Months",
    detail: "Auto Loan · VW Credit",
    monthly_amount_band: "~$685/mo",
    confidence: 0.92,
    recommended_products: ["auto-refi", "premium-travel"],
  },
  {
    id: "college-prep",
    bucket: "life_event",
    label: "College Preparation",
    detail: "Dependent transitioning to college",
    confidence: 0.9,
    recommended_products: ["hy-savings", "managed-portfolio"],
  },
  {
    id: "home-purchase-bay-area",
    bucket: "life_event",
    label: "Home Purchase in the SF Bay Area",
    detail: "Escrow + inspection activity",
    confidence: 0.95,
    recommended_products: ["mortgage-30", "heloc"],
  },
];

export default defineTool({
  name: "get_demo_signals",
  title: "Get Ventus demo signals",
  description:
    "Return the public demo 'external intelligence' signals used in the Ventus bank demo (life events, financial signals) along with sample product recommendations.",
  inputSchema: {
    bucket: z
      .enum(["life_event", "financial_signal", "demographic_shift", "behavioral"])
      .optional()
      .describe("Optional filter by signal bucket. Omit to return all."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ bucket }) => {
    const data = bucket ? SIGNALS.filter((s) => s.bucket === bucket) : SIGNALS;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { signals: data },
    };
  },
});
