import { Tag, Mail, CreditCard, Bot } from "lucide-react";

const CARDS = [
  {
    icon: Tag,
    title: "Personalized deals",
    body: "Relevant offers surfaced when the customer's behavior shows intent.",
    accent: {
      top: "border-t-amber-400/70",
      hover: "group-hover:border-amber-400/40",
      chipBorder: "border-amber-400/20",
      chipBg: "bg-amber-400/10",
      icon: "text-amber-300",
    },
  },
  {
    icon: Mail,
    title: "Personalized emails",
    body: "Messages timed to life events and spending patterns, not batch lists.",
    accent: {
      top: "border-t-blue-400/70",
      hover: "group-hover:border-blue-400/40",
      chipBorder: "border-blue-400/20",
      chipBg: "bg-blue-400/10",
      icon: "text-blue-300",
    },
  },
  {
    icon: CreditCard,
    title: "Personalized cards in digital banking",
    body: "Adaptive in-app cards that reflect the customer's next best action.",
    accent: {
      top: "border-t-emerald-400/70",
      hover: "group-hover:border-emerald-400/40",
      chipBorder: "border-emerald-400/20",
      chipBg: "bg-emerald-400/10",
      icon: "text-emerald-300",
    },
  },
  {
    icon: Bot,
    title: "Personalized outreach powered by AI coworkers",
    body: "Advisor-aware prompts that keep a human in the loop.",
    accent: {
      top: "border-t-violet-400/70",
      hover: "group-hover:border-violet-400/40",
      chipBorder: "border-violet-400/20",
      chipBg: "bg-violet-400/10",
      icon: "text-violet-300",
    },
  },
];

const PersonalizationSection = () => (
  <section
    id="personalization"
    className="scroll-mt-28 border-y border-blue-500/30 bg-[#08111F] py-16 md:py-20"
  >
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">
          Personalization
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
          Personalization, everywhere it matters.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/60">
          The same intelligence powers consistent, context-aware messages across every channel the customer touches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`group rounded-2xl border border-white/10 ${card.accent.top} border-t-[3px] bg-gradient-to-br from-[#0D1B30] to-[#0A1628] p-5 transition-colors ${card.accent.hover}`}
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${card.accent.chipBorder} ${card.accent.chipBg}`}>
                <Icon className={`h-5 w-5 ${card.accent.icon}`} strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-snug text-white/55">
                {card.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default PersonalizationSection;
