import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  onSelectA: (c: DemoCustomer) => void;
  onSelectB: (c: DemoCustomer) => void;
}

export default function DemoCustomerPanel({ customerA, customerB, onSelectA, onSelectB }: Props) {
  return (
    <div className="h-full flex flex-col p-5 overflow-y-auto">
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          Ventus AI
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Conference Demo</p>
      </div>

      {/* Customer A */}
      <CustomerSlot
        label="Customer A"
        color="#3b82f6"
        selected={customerA}
        onSelect={onSelectA}
        excludeId={customerB.id}
      />

      <div className="my-4 border-t border-slate-200" />

      {/* Customer B */}
      <CustomerSlot
        label="Customer B"
        color="#10b981"
        selected={customerB}
        onSelect={onSelectB}
        excludeId={customerA.id}
      />

      <div className="mt-auto pt-6">
        <p className="text-[10px] text-slate-400 text-center">Select two customers to compare personalized outputs</p>
      </div>
    </div>
  );
}

function CustomerSlot({
  label,
  color,
  selected,
  onSelect,
  excludeId,
}: {
  label: string;
  color: string;
  selected: DemoCustomer;
  onSelect: (c: DemoCustomer) => void;
  excludeId: string;
}) {
  const p = selected.profile;
  const initials = p.name.split(" ").map((w) => w[0]).join("");

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color }}>{label}</p>

      <select
        className="w-full bg-white text-slate-900 text-sm rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 mb-3"
        value={selected.id}
        onChange={(e) => {
          const c = DEMO_CUSTOMERS.find((d) => d.id === e.target.value);
          if (c) onSelect(c);
        }}
      >
        {DEMO_CUSTOMERS.filter((d) => d.id !== excludeId).map((d) => (
          <option key={d.id} value={d.id}>{d.profile.name}</option>
        ))}
      </select>

      {/* Mini profile card */}
      <div className="rounded-lg p-3 border border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: `${color}30`, border: `1px solid ${color}60` }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{p.name}</p>
            <p className="text-[10px] text-slate-500">{p.segment} · {p.aum}</p>
          </div>
        </div>

        <div className="space-y-1 text-[11px] text-slate-500">
          <div className="flex justify-between">
            <span>Age</span>
            <span className="text-slate-700">{p.demographics.age}</span>
          </div>
          <div className="flex justify-between">
            <span>Occupation</span>
            <span className="text-slate-700">{p.demographics.occupation}</span>
          </div>
          <div className="flex justify-between">
            <span>Family</span>
            <span className="text-slate-700">{p.demographics.familyStatus}</span>
          </div>
        </div>

        {/* Lifestyle type */}
        <div className="mt-2.5 rounded px-2 py-1.5" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
          <p className="text-[10px] font-semibold" style={{ color }}>{selected.lifestyleType}</p>
          <div className="flex gap-1 mt-1">
            {selected.topPillars.slice(0, 3).map((pil) => (
              <span key={pil.name} className="text-[9px] text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">
                {pil.icon} {pil.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
