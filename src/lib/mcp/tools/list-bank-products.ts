import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Self-contained snapshot of Ventus reference bank products (kept in sync with
// src/lib/bankProductCatalog.ts). Duplicated here so the MCP bundle stays free
// of React / lucide-react imports.
const CATEGORIES = [
  {
    id: "cards",
    label: "Cards",
    products: [
      { id: "premium-travel", name: "Premium Travel Card", pricing: "60,000 pt bonus", terms: "3x travel, no FX fees" },
      { id: "cash-back", name: "Everyday Cash Back Card", pricing: "2% unlimited", terms: "No annual fee" },
    ],
  },
  {
    id: "deposits",
    label: "Deposits",
    products: [
      { id: "hy-savings", name: "High-Yield Savings", pricing: "4.25% APY", terms: "No minimum, FDIC insured" },
      { id: "cd-12mo", name: "12-Month CD", pricing: "4.75% APY", terms: "$1,000 minimum" },
    ],
  },
  {
    id: "lending",
    label: "Lending",
    products: [
      { id: "auto-refi", name: "Auto Refinance", pricing: "from 5.99% APR", terms: "60-72 mo terms" },
      { id: "heloc", name: "HELOC", pricing: "from Prime + 0.5%", terms: "10-yr draw / 20-yr repay" },
      { id: "mortgage-30", name: "30-Year Fixed Mortgage", pricing: "from 6.75% APR", terms: "Conforming, 20% down" },
    ],
  },
  {
    id: "wealth",
    label: "Wealth",
    products: [
      { id: "managed-portfolio", name: "Managed Portfolio", pricing: "0.75% AUM", terms: "$25k minimum" },
      { id: "advisor-access", name: "Dedicated Advisor Access", pricing: "Included at $250k+ AUM", terms: "Quarterly reviews" },
    ],
  },
];

export default defineTool({
  name: "list_bank_products",
  title: "List bank products",
  description:
    "List Ventus reference bank product categories and products (cards, deposits, lending, wealth) with sample pricing and terms.",
  inputSchema: {
    category: z
      .enum(["cards", "deposits", "lending", "wealth"])
      .optional()
      .describe("Optional category filter. Omit to return all categories."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category }) => {
    const data = category ? CATEGORIES.filter((c) => c.id === category) : CATEGORIES;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { categories: data },
    };
  },
});
