import { Package, DollarSign, FileText } from "lucide-react";
import { TabHeader } from "./TabHeader";
import {
  BANK_PRODUCT_CATEGORIES,
  BANK_PRODUCT_TOTAL,
} from "@/lib/bankProductCatalog";
import { cn } from "@/lib/utils";

export function ProductsCatalogView() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Package className="w-4 h-4" />}
        title="Product Catalog"
        subtitle="The full institutional product shelf — referenced from Bank of America as the canonical example."
        howItWorks="Every credit card, deposit account, loan, investment service, and protection product the bank offers is itemized here in one structured catalog, grouped by category."
        whyItMatters="This catalog is the single source of truth for downstream personalization — Next-Product, Campaign Studio, and Automated Flows will all read from it so recommendations stay aligned with the real product shelf."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Total products" value={String(BANK_PRODUCT_TOTAL)} />
        <StatTile label="Categories" value={String(BANK_PRODUCT_CATEGORIES.length)} />
        <StatTile label="Role" value="Source of truth" />
        <StatTile label="Reference institution" value="Bank of America" />
      </div>

      <p className="text-[11px] text-slate-400">
        Pricing shown is reference/sample. Not a live rate quote.
      </p>

      <div className="space-y-8">
        {BANK_PRODUCT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md border",
                    cat.accent,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {cat.label}
                  </h3>
                  <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
                    {cat.description}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 shrink-0">
                  {cat.products.length} products
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {cat.products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[13px] font-semibold text-slate-900 leading-snug">
                        {p.name}
                      </p>
                      {p.badge && (
                        <span className="text-[10px] font-medium text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 shrink-0 whitespace-nowrap">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 leading-snug">
                      {p.tagline}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-900 mt-1 truncate">{value}</p>
    </div>
  );
}
