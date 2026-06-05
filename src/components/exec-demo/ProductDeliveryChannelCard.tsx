import { Smartphone, Mail, MessageSquare, Send } from "lucide-react";

export type ProductDeliveryChannel = "mobile" | "email" | "sms";

interface Props {
  value: ProductDeliveryChannel;
  onChange: (channel: ProductDeliveryChannel) => void;
}

const OPTIONS: { key: ProductDeliveryChannel; label: string; description: string; icon: typeof Smartphone; accent: string }[] = [
  { key: "mobile", label: "Mobile Banking", description: "In-app card", icon: Smartphone, accent: "#3b82f6" },
  { key: "email", label: "Email", description: "Personalized message", icon: Mail, accent: "#f59e0b" },
  { key: "sms", label: "SMS / Text", description: "Short nudge", icon: MessageSquare, accent: "#10b981" },
];

export default function ProductDeliveryChannelCard({ value, onChange }: Props) {
  return (
    <div className="relative h-full rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white overflow-hidden">
      {/* Left accent bar */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-400 to-violet-500" />
      <div className="pl-4 pr-3 py-3 h-full flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Send className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Delivery Channel</span>
          </div>
          <span className="text-[9px] text-slate-400 italic">Preview the touchpoint →</span>
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = value === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onChange(opt.key)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all ${
                  active ? "bg-white shadow-md" : "bg-transparent hover:bg-white/60"
                }`}
                style={
                  active
                    ? { boxShadow: `0 0 0 2px ${opt.accent}, 0 2px 8px ${opt.accent}25` }
                    : undefined
                }
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: active ? `${opt.accent}15` : "transparent",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: active ? opt.accent : "#94a3b8" }} />
                </div>
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold leading-tight ${active ? "text-slate-800" : "text-slate-500"}`}>
                    {opt.label}
                  </p>
                  <p className="text-[9px] text-slate-400 leading-tight truncate">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
