import { ChevronLeft, Phone, Video, Info } from "lucide-react";
import { familyStyle, type ProductCard } from "../ProductCardsPhoneView";

interface Props {
  cards: ProductCard[];
  customerName?: string;
  bankLabel?: string;
}

export default function SmsPreviewPhoneView({ cards, customerName, bankLabel = "Our Bank" }: Props) {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Personalizing message…</span>
      </div>
    );
  }
  const card = cards[0];
  const style = familyStyle(card.type);
  const firstName = (customerName ?? "there").split(" ")[0];
  const benefit = (card.benefits && card.benefits[0]) || "Preferred rate for you";
  const cta = card.cta || "Learn more";

  const messages: { text: string }[] = [
    { text: `Hi ${firstName} — quick note from ${bankLabel}.` },
    { text: `Based on your recent activity, ${card.product_name} could be a great fit. ${card.quote}` },
    { text: `${benefit}. ${cta}: bank.co/offer` },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* iMessage-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-100 shrink-0">
        <ChevronLeft className="w-4 h-4 text-blue-500" />
        <div className="flex flex-col items-center">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: style.accent }}
          >
            {bankLabel.slice(0, 1)}
          </div>
          <p className="text-[9px] font-semibold text-slate-700 mt-0.5">{bankLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-blue-500" />
          <Video className="w-3.5 h-3.5 text-blue-500" />
          <Info className="w-3.5 h-3.5 text-blue-500" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll px-3 py-3 space-y-2">
        <p className="text-center text-[9px] text-slate-400 font-medium">Today · 9:41 AM</p>
        {messages.map((m, i) => (
          <div key={i} className="flex">
            <div
              className="max-w-[80%] rounded-2xl rounded-tl-md px-3 py-2 shadow-sm"
              style={{ background: "white", border: `1px solid ${style.accent}22` }}
            >
              <p className="text-[11px] text-slate-700 leading-snug">{m.text}</p>
            </div>
          </div>
        ))}
        {/* Outgoing tap-back from customer */}
        <div className="flex justify-end pt-1">
          <div className="max-w-[70%] rounded-2xl rounded-tr-md px-3 py-2 bg-blue-500">
            <p className="text-[11px] text-white leading-snug">Tell me more 👍</p>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
          <span className="text-[11px] text-slate-400 flex-1">iMessage</span>
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-[10px]">↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}
