import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

interface Product {
  id: string;
  name: string;
  category: string;
  pricing: string;
  terms: string;
  keywords: string[];
}

const PRODUCTS: Product[] = [
  { id: "premium-travel", name: "Premium Travel Card", category: "cards", pricing: "60,000 pt bonus", terms: "3x travel, no FX fees", keywords: ["travel", "points", "airline", "hotel", "premium"] },
  { id: "cash-back", name: "Everyday Cash Back Card", category: "cards", pricing: "2% unlimited", terms: "No annual fee", keywords: ["cash", "everyday", "grocery", "gas"] },
  { id: "hy-savings", name: "High-Yield Savings", category: "deposits", pricing: "4.25% APY", terms: "No minimum, FDIC insured", keywords: ["savings", "yield", "apy", "emergency fund"] },
  { id: "cd-12mo", name: "12-Month CD", category: "deposits", pricing: "4.75% APY", terms: "$1,000 minimum", keywords: ["cd", "certificate", "deposit", "fixed"] },
  { id: "auto-refi", name: "Auto Refinance", category: "lending", pricing: "from 5.99% APR", terms: "60-72 mo terms", keywords: ["auto", "car", "refinance", "loan"] },
  { id: "heloc", name: "HELOC", category: "lending", pricing: "from Prime + 0.5%", terms: "10-yr draw / 20-yr repay", keywords: ["home equity", "heloc", "renovation"] },
  { id: "mortgage-30", name: "30-Year Fixed Mortgage", category: "lending", pricing: "from 6.75% APR", terms: "Conforming, 20% down", keywords: ["mortgage", "home", "purchase"] },
  { id: "managed-portfolio", name: "Managed Portfolio", category: "wealth", pricing: "0.75% AUM", terms: "$25k minimum", keywords: ["invest", "portfolio", "wealth", "managed"] },
  { id: "advisor-access", name: "Dedicated Advisor Access", category: "wealth", pricing: "Included at $250k+ AUM", terms: "Quarterly reviews", keywords: ["advisor", "wealth", "planning"] },
];

export default defineTool({
  name: "search_bank_products",
  title: "Search bank products",
  description:
    "Search Ventus reference bank products by keyword (e.g. 'travel', 'refinance', 'savings'). Returns matching products with pricing and terms.",
  inputSchema: {
    query: z.string().min(1).describe("Search text. Matched against product name, category, and keywords."),
    limit: z.number().int().min(1).max(20).optional().describe("Max results (default 5)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, limit }) => {
    const q = query.trim().toLowerCase();
    const scored = PRODUCTS.map((p) => {
      const hay = [p.name, p.category, ...p.keywords].join(" ").toLowerCase();
      const score = hay.includes(q) ? 1 : q.split(/\s+/).filter((t) => hay.includes(t)).length;
      return { p, score };
    })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit ?? 5)
      .map((s) => s.p);

    return {
      content: [{ type: "text", text: JSON.stringify(scored, null, 2) }],
      structuredContent: { results: scored },
    };
  },
});
