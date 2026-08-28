import ScrollReveal from "@/components/ScrollReveal";
import HueField from "@/components/HueField";

const columns = [
  {
    num: "01",
    label: "RETENTION",
    title: "Keep customers longer.",
    body: "Behavioral signals surface the right moment to engage — before customers go looking elsewhere.",
  },
  {
    num: "02",
    label: "GROWTH",
    title: "Grow assets under management.",
    body: "Personalized offers and products that match real customer behavior convert at higher rates.",
  },
  {
    num: "03",
    label: "REVENUE",
    title: "Win more relationships.",
    body: "Life event detection connects advisors to customers at exactly the right financial moment.",
  },
];

const ProblemStatementSection = () => {
  return (
    <section id="problem" className="bg-white w-full scroll-mt-20 pt-24 md:pt-28 pb-14 md:pb-20 relative z-10 overflow-hidden">
      <HueField
        blobs={[
          { hue: "sky", size: 720, top: "-25%", right: "-12%" },
          { hue: "indigo", size: 520, bottom: "-18%", left: "-8%", opacity: 0.4 },
        ]}
      />
      <div className="mx-auto mb-8 md:mb-10 max-w-7xl px-6 md:px-8 relative z-10">
        <ScrollReveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
            The Gap
          </p>
          <h2 className="font-bold tracking-tight text-gray-900 leading-[1.1] text-left text-[34px] sm:text-4xl md:text-5xl xl:text-[64px] max-w-5xl">
            Your bank knows what a customer spent. <span className="text-gray-400">Not why.</span>
          </h2>
          <p className="italic mt-5 md:mt-6 text-[23px] md:text-[25px]" style={{ color: "#2563EB" }}>
            Ventus is the behavioral intelligence layer that bridges the gap.
          </p>
        </ScrollReveal>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {columns.map((c, i) => (
            <div
              key={c.label}
              className={`relative min-w-0 px-5 py-16 lg:px-6 ${
                i > 0 ? "border-t border-gray-200 lg:border-l lg:border-t-0" : ""
              }`}
            >
              <span
                className="pointer-events-none absolute left-5 top-4 select-none text-[100px] font-bold leading-none lg:left-6 lg:text-[120px]"
                style={{ color: "rgba(37,99,235,0.08)" }}
              >
                {c.num}
              </span>
              <div className="relative z-10 pt-14">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
                  {c.label}
                </p>
                <h3 className="mb-2 text-[30px] font-bold text-gray-900 leading-tight">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementSection;
