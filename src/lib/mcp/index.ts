import { defineMcp } from "@lovable.dev/mcp-js";
import listBankProducts from "./tools/list-bank-products";
import searchBankProducts from "./tools/search-bank-products";
import getDemoSignals from "./tools/get-demo-signals";

export default defineMcp({
  name: "ventus-ai-mcp",
  title: "Ventus AI",
  version: "0.1.0",
  instructions:
    "Tools for exploring Ventus AI's reference bank product catalog and public demo intelligence signals. " +
    "Use `list_bank_products` to browse categories, `search_bank_products` for keyword lookups, and " +
    "`get_demo_signals` to see the sample life-event and financial signals used in the /bankdemo experience. " +
    "All data returned is public demo/reference content.",
  tools: [listBankProducts, searchBankProducts, getDemoSignals],
});
