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
    className="scroll-mt-28 border-y border-white/10 bg-[#08111F] py-16 md:py-20"
  >
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">
          Personalization
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
          Personalization, everywhere it matters.
        </h2>
        <p className="mt-4 text-base leading-[1.65] text-white/75">
          The same intelligence powers consistent, context-aware experiences across every channel the customer touches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <Icon className="h-5 w-5 text-white/70" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-base leading-[1.65] text-white/70">
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
