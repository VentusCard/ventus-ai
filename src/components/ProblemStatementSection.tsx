import HueField from "@/components/HueField";

const columns = [
  {
    num: "01",
    label: "WIN MORE PRODUCTS",
    title: "Win more products.",
    body: "Behavioral signals reveal the right product for the right customer, so offers convert instead of interrupt.",
  },
  {
    num: "02",
    label: "RETAIN FOR LONGER",
    title: "Retain for longer.",
    body: "Early life-event and churn signals let the bank engage before customers start shopping elsewhere.",
  },
  {
    num: "03",
    label: "GROW DEPOSITS",
    title: "Grow deposits.",
    body: "Personalized nudges and context-aware prompts steer surplus cash into the bank's deposit products.",
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
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
          The Gap
        </p>
        <h2 className="font-bold tracking-tight text-gray-900 leading-[1.1] text-left text-[34px] sm:text-4xl md:text-5xl xl:text-[64px] max-w-5xl">
          Banks have transaction data. <span className="text-gray-400">Ventus turns it into behavioral intelligence and personalization orchestration.</span>
        </h2>
        <p className="mt-5 md:mt-6 max-w-4xl text-[19px] md:text-xl leading-[1.65] text-gray-600">
          Understand what customers do, why they do it, and act on it across every channel, automatically and at scale.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {columns.map((c, i) => (
            <div
              key={c.label}
              className={`relative min-w-0 px-5 py-10 lg:px-6 ${
                i > 0 ? "border-t border-gray-200 lg:border-l lg:border-t-0" : ""
              }`}
            >
              <div className="relative z-10">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
                  <span className="text-gray-400">{c.num}</span>
                  {c.label}
                </p>
                <h3 className="mb-2 text-[30px] font-bold text-gray-900 leading-tight">
                  {c.title}
                </h3>
                <p className="text-base leading-[1.65] text-gray-700">
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
