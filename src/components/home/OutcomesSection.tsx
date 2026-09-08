const CARDS = [
  {
    eyebrow: "Card spend",
    title: "More card spend.",
    body: "When the offer matches what someone actually buys, they put more on your card instead of someone else's. That's interchange you're currently giving away.",
  },
  {
    eyebrow: "Product growth",
    title: "More products per customer.",
    body: "Life events are the moment a product becomes relevant. Detect the moment and you're the bank that showed up first.",
  },
  {
    eyebrow: "Deposits",
    title: "More deposits.",
    body: "Idle cash sitting at another institution is visible in the data. So is the moment a customer starts shopping for yield.",
  },
  {
    eyebrow: "Retention",
    title: "Fewer customers leaving.",
    body: "Behavioral change shows up before attrition does. Engage at the signal, not at the exit interview.",
  },
];

const OutcomesSection = () => (
  <section id="outcomes" className="scroll-mt-24 bg-white py-24 md:py-28">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Why it matters</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
        Four things move when you know why.
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div
            key={c.eyebrow}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              {c.eyebrow}
            </p>
            <h3 className="mt-3 text-lg font-bold text-gray-900">{c.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default OutcomesSection;
