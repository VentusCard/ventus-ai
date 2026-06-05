import { Smartphone, Mail, MessageSquare } from "lucide-react";

export type ProductDeliveryChannel = "mobile" | "email" | "sms";

interface Props {
  value: ProductDeliveryChannel;
  onChange: (channel: ProductDeliveryChannel) => void;
}

const OPTIONS: { key: ProductDeliveryChannel; label: string; description: string; icon: typeof Smartphone; accent: string; tint: string; ring: string }[] = [
  { key: "mobile", label: "Mobile Banking", description: "In-app push card", icon: Smartphone, accent: "text-blue-600", tint: "bg-blue-50", ring: "ring-blue-400 border-blue-300" },
  { key: "email", label: "Email", description: "Personalized message", icon: Mail, accent: "text-amber-600", tint: "bg-amber-50", ring: "ring-amber-400 border-amber-300" },
  { key: "sms", label: "SMS / Text", description: "Short outreach nudge", icon: MessageSquare, accent: "text-emerald-600", tint: "bg-emerald-50", ring: "ring-emerald-400 border-emerald-300" },
];

export default function ProductDeliveryChannelCard({ value, onChange }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Delivery Channel</p>
          <p className="text-[10px] text-slate-400">Preview how this recommendation reaches the customer</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                active
                  ? `${opt.tint} ${opt.ring} ring-2`
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-white" : "bg-slate-50"}`}>
                <Icon className={`w-3.5 h-3.5 ${active ? opt.accent : "text-slate-400"}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-bold leading-tight ${active ? "text-slate-800" : "text-slate-600"}`}>{opt.label}</p>
                <p className="text-[9px] text-slate-400 leading-tight truncate">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
