import ScrollReveal from "@/components/ScrollReveal";

const columns = [
  {
    label: "01 · RETENTION",
    title: "Keep customers longer.",
    body: "Behavioral signals surface the right moment to engage — before customers go looking elsewhere.",
  },
  {
    label: "02 · GROWTH",
    title: "Grow assets under management.",
    body: "Life event detection connects advisors to customers at exactly the right financial moment.",
  },
  {
    label: "03 · REVENUE",
    title: "Win more relationships.",
    body: "Personalized offers and products that match real customer behavior convert at higher rates.",
  },
];

const ProblemStatementSection = () => {
  return (
    <section className="bg-white w-full" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-600 uppercase mb-5">
            THE GAP
          </p>
          <h2 className="font-bold tracking-tight text-gray-900 leading-[1.05] text-left text-4xl md:text-5xl xl:text-[64px] max-w-5xl">
            Your bank knows what a customer spent. <span className="text-gray-400">Not why.</span>
          </h2>
        </ScrollReveal>

        <div style={{ marginTop: 32, marginBottom: 40 }}>
          <p className="italic" style={{ color: "#2563EB", fontSize: 17 }}>
            Ventus is the behavioral intelligence layer that bridges the gap.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ columnGap: 48, rowGap: 32 }}
        >
          {columns.map((c) => (
            <div
              key={c.label}
              className="text-left"
              style={{ borderTop: "1px solid #BFDBFE", paddingTop: 24 }}
            >
              <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-600 uppercase mb-3">
                {c.label}
              </p>
              <h3
                className="font-bold text-gray-900 leading-tight mb-3"
                style={{ fontSize: 28 }}
              >
                {c.title}
              </h3>
              <p className="text-[#6B7280] leading-relaxed" style={{ fontSize: 16 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProblemStatementSection;
