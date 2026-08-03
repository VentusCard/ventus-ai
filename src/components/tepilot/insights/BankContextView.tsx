import { useState } from "react";
import {
  Package,
  DollarSign,
  FileText,
  MapPin,
  Users,
  Crown,
  Building2,
  Briefcase,
  ShieldAlert,
  Home as HomeIcon,
  Gem,
  Wallet,
} from "lucide-react";
import { TabHeader } from "./TabHeader";
import {
  BANK_PRODUCT_CATEGORIES,
  BANK_PRODUCT_TOTAL,
} from "@/lib/bankProductCatalog";
import { cn } from "@/lib/utils";

type SubTab = "products" | "locations" | "departments" | "segments";

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: "products", label: "Products", icon: Package },
  { id: "locations", label: "Locations & Hours", icon: MapPin },
  { id: "departments", label: "Departments", icon: Users },
  { id: "segments", label: "Segments & Tiers", icon: Crown },
];

export function BankContextView() {
  const [subTab, setSubTab] = useState<SubTab>("products");

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Building2 className="w-4 h-4" />}
        title="Bank Context"
        subtitle="The bank's operational context — products, locations, org structure, and customer tiers — that shapes what Ventus can recommend and to whom."
        howItWorks="Bank Context bundles four facets referenced by every downstream module: the product catalog (Consumer Banking, Lending, Wealth), the branch and ATM footprint, the servicing org and escalation paths, and the customer segment/tier thresholds."
        whyItMatters="This is the single source of truth for who the bank can serve, what it can offer, where it can offer it, and which team owns the relationship — Next-Product, Campaign Studio, Automated Flows, and the AI Banking Assistant all read from it."
      />

      {/* Sub-tab nav */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-50 border border-slate-200 w-fit">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
                active
                  ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", active ? "text-blue-600" : "text-slate-400")} />
              {t.label}
            </button>
          );
        })}
      </div>

      {subTab === "products" && <ProductsPanel />}
      {subTab === "locations" && <LocationsPanel />}
      {subTab === "departments" && <DepartmentsPanel />}
      {subTab === "segments" && <SegmentsPanel />}
    </div>
  );
}

// Back-compat export in case any external import still uses the old name.
export { BankContextView as ProductsCatalogView };

// ---------- Products ----------

function ProductsPanel() {
  return (
    <div className="space-y-6">
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
                    {(p.pricing || p.terms) && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        {p.pricing && (
                          <div className="flex items-start gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium leading-tight">
                                Pricing
                              </p>
                              <p className="text-[12px] text-slate-700 leading-snug">
                                {p.pricing}
                              </p>
                            </div>
                          </div>
                        )}
                        {p.terms && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium leading-tight">
                                Terms
                              </p>
                              <p className="text-[12px] text-slate-700 leading-snug">
                                {p.terms}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

// ---------- Locations ----------

const REGIONS = [
  { region: "Northeast",  states: "NY · NJ · MA · CT · PA · ME · NH · VT · RI", branches: 812, atms: 4120, weekday: "9a–5p", saturday: "9a–2p", sunday: "Closed" },
  { region: "Southeast",  states: "FL · GA · NC · SC · VA · TN · AL",           branches: 964, atms: 4880, weekday: "9a–5p", saturday: "9a–2p", sunday: "Select" },
  { region: "Midwest",    states: "IL · OH · MI · MO · IN · WI · MN",           branches: 611, atms: 3060, weekday: "9a–5p", saturday: "9a–1p", sunday: "Closed" },
  { region: "Southwest",  states: "TX · AZ · NM · OK",                          branches: 742, atms: 3980, weekday: "9a–6p", saturday: "9a–2p", sunday: "Select" },
  { region: "West",       states: "CA · NV · UT · CO",                          branches: 1103,atms: 5240, weekday: "9a–6p", saturday: "9a–3p", sunday: "Select" },
  { region: "Northwest",  states: "WA · OR · ID · MT",                          branches: 268, atms: 1340, weekday: "9a–5p", saturday: "9a–1p", sunday: "Closed" },
];

function LocationsPanel() {
  const totalBranches = REGIONS.reduce((n, r) => n + r.branches, 0);
  const totalATMs = REGIONS.reduce((n, r) => n + r.atms, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Regions" value={String(REGIONS.length)} />
        <StatTile label="Branches" value={totalBranches.toLocaleString()} />
        <StatTile label="ATMs" value={totalATMs.toLocaleString()} />
        <StatTile label="Coverage" value="All 50 states" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="text-left font-medium px-3 py-2">Region</th>
              <th className="text-left font-medium px-3 py-2">States</th>
              <th className="text-right font-medium px-3 py-2">Branches</th>
              <th className="text-right font-medium px-3 py-2">ATMs</th>
              <th className="text-left font-medium px-3 py-2">Weekday</th>
              <th className="text-left font-medium px-3 py-2">Saturday</th>
              <th className="text-left font-medium px-3 py-2">Sunday</th>
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((r) => (
              <tr key={r.region} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                <td className="px-3 py-2 font-semibold text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {r.region}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">{r.states}</td>
                <td className="px-3 py-2 text-right text-slate-700 tabular-nums">{r.branches.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-700 tabular-nums">{r.atms.toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-600">{r.weekday}</td>
                <td className="px-3 py-2 text-slate-600">{r.saturday}</td>
                <td className="px-3 py-2 text-slate-600">{r.sunday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400">
        Footprint figures are illustrative and used to gate region-specific product offers and appointment routing.
      </p>
    </div>
  );
}

// ---------- Departments ----------

const DEPARTMENTS = [
  {
    label: "Retail Relationship Managers",
    icon: Users,
    coverage: "Mass market · Preferred (Gold/Platinum)",
    specialization: "Everyday banking, small deposits, credit cards, personal loans",
    escalation: "Escalates HNW referrals to Wealth Advisor within 24h",
    headcount: "~9,200",
  },
  {
    label: "Small Business Bankers",
    icon: Briefcase,
    coverage: "Sole prop through $10M revenue businesses",
    specialization: "Business checking, SBA lending, merchant services, treasury",
    escalation: "Escalates $10M+ revenue to Commercial Banking",
    headcount: "~2,400",
  },
  {
    label: "Mortgage Loan Officers",
    icon: HomeIcon,
    coverage: "Consumer + jumbo mortgages, HELOC",
    specialization: "Purchase, refi, first-time buyer, VA/FHA, portfolio jumbo",
    escalation: "Coordinates with Wealth Advisor on $2M+ jumbo",
    headcount: "~3,100",
  },
  {
    label: "Wealth Advisors (Merrill)",
    icon: Gem,
    coverage: "Investable assets $250K – $10M",
    specialization: "Managed portfolios, retirement, estate, tax-aware investing",
    escalation: "Escalates $10M+ investable to Private Bank",
    headcount: "~14,800",
  },
  {
    label: "Private Bank",
    icon: Crown,
    coverage: "$10M+ investable / UHNW households",
    specialization: "Trust, custom credit, art & aircraft finance, family office",
    escalation: "Direct line to specialist teams and general counsel",
    headcount: "~1,600",
  },
  {
    label: "Fraud & AML Operations",
    icon: ShieldAlert,
    coverage: "All account types, 24/7",
    specialization: "Transaction anomaly, structuring, sanctions, dispute resolution",
    escalation: "Auto-flags to BSA officer for SAR filing when scored",
    headcount: "~2,100",
  },
];

function DepartmentsPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {DEPARTMENTS.map((d) => {
        const Icon = d.icon;
        return (
          <div
            key={d.label}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-50 border border-slate-200 shrink-0">
                <Icon className="w-4 h-4 text-slate-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-900 leading-snug">{d.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Headcount {d.headcount}</p>
              </div>
            </div>
            <dl className="space-y-2 text-[12px]">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Coverage</dt>
                <dd className="text-slate-700 leading-snug">{d.coverage}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Specialization</dt>
                <dd className="text-slate-700 leading-snug">{d.specialization}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Escalation</dt>
                <dd className="text-slate-700 leading-snug">{d.escalation}</dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Segments ----------

const SEGMENTS = [
  { tier: "Mass Market",              threshold: "< $20K combined balance",     benefits: "Standard checking/savings, base cards, digital banking", servicing: "Branch + digital self-serve", accent: "bg-slate-50 text-slate-700 border-slate-200" },
  { tier: "Preferred Rewards — Gold", threshold: "$20K – $50K combined",        benefits: "25% rewards bonus, interest boost, fee waivers",         servicing: "Branch RM + priority phone",   accent: "bg-amber-50 text-amber-700 border-amber-200" },
  { tier: "Preferred Rewards — Platinum", threshold: "$50K – $100K combined",   benefits: "50% rewards bonus, mortgage rate discount",             servicing: "Dedicated RM",                 accent: "bg-slate-50 text-slate-700 border-slate-300" },
  { tier: "Preferred Rewards — Platinum Honors", threshold: "$100K – $1M combined", benefits: "75% rewards bonus, no-fee trades, larger discounts", servicing: "Dedicated RM + advisor intro", accent: "bg-blue-50 text-blue-700 border-blue-200" },
  { tier: "Merrill Wealth Management", threshold: "$250K – $10M investable",     benefits: "Managed portfolios, planning, tax-aware investing",     servicing: "Wealth Advisor",              accent: "bg-violet-50 text-violet-700 border-violet-200" },
  { tier: "Diamond / Private Bank",   threshold: "$1M+ deposits · $10M+ investable", benefits: "Custom credit, trust, family office, concierge",   servicing: "Private Banker + specialists", accent: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

function SegmentsPanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Tiers" value={String(SEGMENTS.length)} />
        <StatTile label="Program" value="Preferred Rewards" />
        <StatTile label="Wealth arm" value="Merrill" />
        <StatTile label="Top tier" value="Private Bank" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="text-left font-medium px-3 py-2">Tier</th>
              <th className="text-left font-medium px-3 py-2">Threshold</th>
              <th className="text-left font-medium px-3 py-2">Benefits</th>
              <th className="text-left font-medium px-3 py-2">Servicing model</th>
            </tr>
          </thead>
          <tbody>
            {SEGMENTS.map((s) => (
              <tr key={s.tier} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 align-top">
                <td className="px-3 py-2">
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium", s.accent)}>
                    <Wallet className="w-3 h-3" />
                    {s.tier}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-700">{s.threshold}</td>
                <td className="px-3 py-2 text-slate-600 leading-snug">{s.benefits}</td>
                <td className="px-3 py-2 text-slate-600">{s.servicing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400">
        Thresholds mirror the Bank of America Preferred Rewards program used as reference. Segment tags drive Next-Product eligibility, servicing routing, and offer tiering.
      </p>
    </div>
  );
}

// ---------- Shared ----------

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
