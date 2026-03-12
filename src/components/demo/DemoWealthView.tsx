import type { DemoCustomer } from "@/lib/demoData";
import { TrendingUp, Shield, DollarSign, PieChart } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

export default function DemoWealthView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomerWealth customer={customerA} color="#3b82f6" />
      <CustomerWealth customer={customerB} color="#10b981" />
    </div>
  );
}

function CustomerWealth({ customer, color }: { customer: DemoCustomer; color: string }) {
  const holdings = customer.profile.holdings;
  const compliance = customer.profile.compliance;

  const holdingItems = [
    { label: "Deposits", value: holdings.deposit, icon: DollarSign },
    { label: "Credit", value: holdings.credit, icon: DollarSign },
    { label: "Mortgage", value: holdings.mortgage, icon: DollarSign },
    { label: "Investments", value: holdings.investments, icon: TrendingUp },
  ];

  // Derive advisor actions from life events
  const advisorActions = customer.lifeEvents.slice(0, 2).map(event => ({
    action: `Review ${event.name.toLowerCase()} implications`,
    timing: event.timing,
    priority: event.urgency,
  }));

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>Wealth Management Copilot</p>

      {/* Client Snapshot */}
      <div className="rounded-lg border border-slate-200 p-3 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-semibold text-slate-700">Client Snapshot</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[9px] text-slate-400">AUM</span>
            <p className="text-xs font-semibold text-slate-900">{customer.profile.aum}</p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400">Segment</span>
            <p className="text-xs font-semibold text-slate-900">{customer.profile.segment}</p>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="rounded-lg border border-slate-200 p-3 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-semibold text-slate-700">Portfolio Holdings</p>
        </div>
        <div className="space-y-1.5">
          {holdingItems.map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{item.label}</span>
              <span className="text-[10px] font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk & Compliance */}
      <div className="rounded-lg border border-slate-200 p-3 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-semibold text-slate-700">Risk & Compliance</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-slate-400">Risk Profile</span>
            <p className="text-slate-900 font-semibold">{compliance.riskProfile}</p>
          </div>
          <div>
            <span className="text-slate-400">KYC Status</span>
            <p className="text-slate-900 font-semibold">{compliance.kycStatus}</p>
          </div>
          <div>
            <span className="text-slate-400">Last Review</span>
            <p className="text-slate-900 font-semibold">{compliance.lastReview}</p>
          </div>
          <div>
            <span className="text-slate-400">Next Review</span>
            <p className="text-slate-900 font-semibold">{compliance.nextReview}</p>
          </div>
        </div>
      </div>

      {/* Advisor Actions */}
      {advisorActions.length > 0 && (
        <div className="rounded-lg p-3 border" style={{ background: `${color}04`, borderColor: `${color}20` }}>
          <p className="text-[10px] font-semibold mb-2" style={{ color }}>Recommended Actions</p>
          <div className="space-y-1.5">
            {advisorActions.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-700">{a.action}</span>
                <span className="text-slate-400 text-[9px]">{a.timing}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
