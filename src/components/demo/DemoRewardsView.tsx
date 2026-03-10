import type { DemoCustomer } from "@/lib/demoData";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

export default function DemoRewardsView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomerRewards customer={customerA} color="#3b82f6" />
      <CustomerRewards customer={customerB} color="#10b981" />
    </div>
  );
}

function CustomerRewards({ customer, color }: { customer: DemoCustomer; color: string }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>Personalized Deals</p>

      {customer.deals.map((deal, i) => (
        <div
          key={deal.brand}
          className="rounded-lg p-3 border border-slate-700/50 animate-fade-in"
          style={{ background: "rgba(255,255,255,0.02)", animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">{deal.brand}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                {deal.tag}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${deal.match}%`, background: color }} />
              </div>
              <span className="text-[9px] font-semibold text-slate-400">{deal.match}%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{deal.offer}</p>
        </div>
      ))}

      {/* Why personalized */}
      <div className="rounded-lg p-3 border" style={{ background: `${color}06`, borderColor: `${color}25` }}>
        <p className="text-[10px] font-semibold" style={{ color }}>Why these deals?</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Based on <span className="text-white font-medium">{customer.lifestyleType}</span> profile — 
          top spending in {customer.topPillars.slice(0, 2).map(p => p.name).join(" & ")}
        </p>
      </div>
    </div>
  );
}
