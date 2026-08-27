import { Inbox, Star, ArrowLeft, Reply, Forward, MoreVertical, Check } from "lucide-react";
import { familyStyle, type ProductCard } from "../ProductCardsPhoneView";

interface Props {
  cards: ProductCard[];
  customerName?: string;
  bankLabel?: string;
}

export default function EmailPreviewPhoneView({ cards, customerName, bankLabel = "Our Bank" }: Props) {
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
  const benefits = (card.benefits && card.benefits.length > 0
    ? card.benefits
    : ["Tailored to your recent activity", "Preferred rate for relationship clients", "Activate in under a minute"]
  ).slice(0, 3);
  const subject = card.offer_headline || card.product_name;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mail toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <Inbox className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-semibold text-slate-500">Inbox</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
          <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll">
        {/* Subject */}
        <div className="px-3 pt-3">
          <p className="text-[14px] font-bold text-slate-800 leading-snug">{subject}</p>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: style.accent }}
            >
              {bankLabel.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-700 truncate">{bankLabel} <span className="text-slate-400 font-normal">&lt;offers@bank.com&gt;</span></p>
              <p className="text-[10px] text-slate-400">to {firstName} · just now</p>
            </div>
          </div>
        </div>

        {/* Hero banner */}
        <div
          className="mx-3 mt-3 rounded-xl overflow-hidden border border-slate-100"
          style={{ background: style.gradient, borderTop: `3px solid ${style.accent}` }}
        >
          <div className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: style.accent }}>
              Just for you, {firstName}
            </p>
            <p className="text-[15px] font-bold text-slate-800 leading-tight">{card.product_name}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-3 space-y-2.5">
          <p className="text-[11px] text-slate-700 leading-relaxed">Hi {firstName},</p>
          <p className="text-[11px] text-slate-700 leading-relaxed italic">"{card.quote}"</p>
          <div className="space-y-1.5 pt-1">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: style.accent }} />
                <span className="text-[11px] text-slate-700 leading-snug">{b}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full py-2.5 rounded-lg text-[12px] font-bold text-white shadow-sm mt-2"
            style={{ background: style.accent }}
          >
            {card.cta || "Learn More"}
          </button>
          <p className="text-[10px] text-slate-400 pt-1">Sent because you're a valued {bankLabel} customer.</p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-around px-3 py-2 border-t border-slate-100 shrink-0">
        <button className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <Reply className="w-3 h-3" /> Reply
        </button>
        <button className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <Forward className="w-3 h-3" /> Forward
        </button>
      </div>
    </div>
  );
}
