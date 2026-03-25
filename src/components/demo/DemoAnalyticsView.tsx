import type { DemoCustomer } from "@/lib/demoData";

interface Props {
  customer: DemoCustomer;
}

export default function DemoAnalyticsView({ customer }: Props) {
  return <CustomerAnalytics customer={customer} color="#3b82f6" />;
}

function CustomerAnalytics({ customer, color }: { customer: DemoCustomer; color: string }) {
  const totalSpend = customer.topPillars.reduce((s, p) => s + parseInt(p.spend.replace(/[$,]/g, "")), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total Spend", value: `$${totalSpend.toLocaleString()}` },
          { label: "Segment", value: customer.profile.segment },
          { label: "AUM", value: customer.profile.aum },
        ].map((m) => (
          <div key={m.label} className="rounded-lg p-3 border border-slate-200 bg-white">
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">{m.label}</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-4 border border-slate-200 bg-white">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color }}>Spending Distribution</p>
        <div className="space-y-2.5">
          {customer.pillarBreakdown.map((p) => (
            <div key={p.pillar}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">{p.pillar}</span>
                <span className="text-slate-900 font-semibold">{p.pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${p.pct}%`, background: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg p-3 border" style={{ background: `${color}06`, borderColor: `${color}25` }}>
        <p className="text-[10px] font-bold" style={{ color }}>Identified Persona</p>
        <p className="text-sm font-semibold text-slate-900">{customer.lifestyleType}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {customer.topPillars.map((pil) => (
            <span key={pil.name} className="text-[9px] text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">
              {pil.icon} {pil.name} ({pil.pct}%)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
