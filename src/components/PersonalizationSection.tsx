import { Tag, Mail, CreditCard, Bot } from "lucide-react";

const CARDS = [
  {
    icon: Tag,
    title: "Personalized deals",
    body: "Relevant offers surfaced when the customer's behavior shows intent.",
  },
  {
    icon: Mail,
    title: "Personalized emails",
    body: "Messages timed to life events and spending patterns, not batch lists.",
  },
  {
    icon: CreditCard,
    title: "Personalized cards in digital banking",
    body: "Adaptive in-app cards that reflect the customer's next best action.",
  },
  {
    icon: Bot,
    title: "Personalized outreach powered by AI coworkers",
    body: "Advisor-aware prompts that keep a human in the loop.",
  },
];

const PersonalizationSection = () => (
  <section
    id="personalization"
    className="scroll-mt-28 border-y border-blue-500/30 bg-[#08111F] py-24 md:py-28"
  >
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <div className="mb-14 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">
          Personalization
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
          Personalization, everywhere it matters.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/60">
          The same intelligence powers consistent, context-aware messages across every channel the customer touches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#0D1B30] to-[#0A1628] p-6 transition-colors hover:border-blue-400/30"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                <Icon className="h-5 w-5 text-blue-300" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
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
