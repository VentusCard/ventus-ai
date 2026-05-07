import ScrollReveal from "@/components/ScrollReveal";

const columns = [
  {
    label: "01 · STATUS QUO",
    title: "Enrichment stops at the merchant.",
    body: "Most providers clean and label transactions. They name the merchant. They guess a category. Then they stop — leaving teams to guess what to do with the data.",
  },
  {
    label: "02 · WHAT'S MISSING",
    title: "The why behind the what.",
    body: "Banks need to know intent, life stage, and trajectory — signals that span dozens of transactions over weeks or months, not single labels in isolation.",
  },
  {
    label: "03 · THE OPPORTUNITY",
    title: "One signal layer, every team.",
    body: "Marketing, advisors, rewards, product — all want the same intelligence. Ventus produces it once, then routes it everywhere through a single API.",
  },
];

const ProblemStatementSection = () => {
  return (
    <section className="bg-white w-full" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-600 uppercase mb-5">
            01 · THE GAP
          </p>
          <h2
            className="font-bold tracking-tight text-gray-900 leading-[1.05] text-left text-4xl md:text-5xl xl:text-[64px] max-w-5xl"
          >
            Your bank knows what a customer spent. <span className="text-gray-400">Not why.</span>
          </h2>
          <p
            className="mt-6 text-[#6B7280] leading-relaxed text-left"
            style={{ fontSize: 18, maxWidth: 600 }}
          >
            Categorization tells you Restaurant — $58. It can't tell you the customer is a new parent looking for life insurance, applying their child to college, or about to book another trip. Behavior is the layer above category — and it's where every personalized banking moment lives.
          </p>
        </ScrollReveal>

        <div
          className="mt-16 grid grid-cols-1 md:grid-cols-3"
          style={{ columnGap: 48, rowGap: 32 }}
        >
          {columns.map((c) => (
            <div
              key={c.label}
              className="text-left"
              style={{ borderTop: "1px solid #E5E7EB", paddingTop: 24 }}
            >
              <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
                {c.label}
              </p>
              <h3 className="text-[20px] font-bold text-gray-900 leading-snug mb-3">
                {c.title}
              </h3>
              <p className="text-[15px] text-[#6B7280] leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16" style={{ borderTop: "1px solid #E5E7EB" }} />
        <p
          className="mt-8 text-center italic"
          style={{ color: "#374151", fontSize: 18 }}
        >
          Banks that know their customers grow more assets, retain more customers, and win more relationships.
        </p>
      </div>
    </section>
  );
};

export default ProblemStatementSection;
