import type { DemoCustomer } from "@/lib/demoData";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

export default function DemoEngagementView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PhoneMockup customer={customerA} color="#3b82f6" />
      <PhoneMockup customer={customerB} color="#10b981" />
    </div>
  );
}

function PhoneMockup({ customer, color }: { customer: DemoCustomer; color: string }) {
  const firstName = customer.profile.name.split(" ")[0];
  const budgets = customer.topPillars.map((p) => ({
    name: p.name,
    icon: p.icon,
    spend: parseInt(p.spend.replace(/[$,]/g, "")),
    budget: Math.round(parseInt(p.spend.replace(/[$,]/g, "")) * (1 + Math.random() * 0.3)),
  }));

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[280px]">
        {/* Phone frame */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Browser bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-300" />
              <span className="w-2 h-2 rounded-full bg-yellow-300" />
              <span className="w-2 h-2 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-[8px] text-slate-400 font-mono bg-white rounded px-2 py-0.5 border border-slate-200">
                yourbank.com/app
              </span>
            </div>
          </div>

          {/* App content */}
          <div className="p-3 space-y-2.5 bg-white">
            <div>
              <p className="text-sm font-bold text-slate-900">Good morning, {firstName}</p>
              <p className="text-[9px] text-slate-400">Your personalized banking experience</p>
            </div>

            {/* Lifestyle banner */}
            <div
              className="rounded-lg px-3 py-2.5"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}90)` }}
            >
              <p className="text-[8px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
                Your Lifestyle
              </p>
              <p className="text-xs font-bold text-white uppercase">{customer.lifestyleType}</p>
              <p className="text-[9px] text-white/70 mt-0.5">
                Top spending: {customer.topPillars[0].name} & {customer.topPillars[1].name}
              </p>
            </div>

            {/* Personalized offers */}
            <div>
              <p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase mb-1.5">For You</p>
              <div className="space-y-1">
                {customer.deals.slice(0, 3).map((deal) => (
                  <div key={deal.brand} className="flex items-center justify-between rounded px-2 py-1.5 bg-slate-50 border border-slate-200">
                    <div className="min-w-0 mr-2">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-semibold text-slate-900">{deal.brand}</p>
                        <span className="text-[7px] text-slate-400">{deal.match}%</span>
                      </div>
                      <p className="text-[8px] text-slate-500 truncate">{deal.offer}</p>
                    </div>
                    <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${color}12`, color }}>
                      {deal.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending grid */}
            <div>
              <p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase mb-1.5">Your Lifestyle Spending</p>
              <div className="grid grid-cols-2 gap-1">
                {budgets.slice(0, 4).map((b) => {
                  const pct = Math.min((b.spend / b.budget) * 100, 100);
                  const isOver = b.spend > b.budget;
                  const barColor = isOver ? "#ef4444" : pct > 80 ? "#f59e0b" : "#22c55e";
                  return (
                    <div key={b.name} className="rounded px-2 py-1.5 bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px]">{b.icon}</span>
                        <span className="text-[9px] font-semibold text-slate-900">{b.name}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-200 mb-0.5">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                      <p className="text-[7px] text-slate-400">${b.spend.toLocaleString()} / ${b.budget.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
