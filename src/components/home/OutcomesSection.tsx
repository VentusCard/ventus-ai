import ScrollReveal from "@/components/ScrollReveal";
import HueField from "@/components/HueField";

const columns = [
  {
    num: "01",
    label: "CARD SPEND",
    title: "More card spend.",
    body: "When the offer matches what someone actually buys, they put more on your card instead of someone else's. That's interchange you're currently giving away.",
  },
  {
    num: "02",
    label: "PRODUCT GROWTH",
    title: "More products per customer.",
    body: "Life events are the moment a product becomes relevant. Detect the moment and you're the bank that showed up first.",
  },
  {
    num: "03",
    label: "DEPOSITS",
    title: "More deposits.",
    body: "Idle cash sitting at another institution is visible in the data. So is the moment a customer starts shopping for yield.",
  },
  {
    num: "04",
    label: "RETENTION",
    title: "Fewer customers leaving.",
    body: "Behavioral change shows up before attrition does. Engage at the signal, not at the exit interview.",
  },
];

const borderClasses = [
  "",
  "border-t border-gray-200 sm:border-l sm:border-t-0 lg:border-l lg:border-t-0",
  "border-t border-gray-200 lg:border-l lg:border-t-0",
  "border-t border-gray-200 sm:border-l lg:border-l lg:border-t-0",
];

const OutcomesSection = () => {
  return (
    <section id="outcomes" className="relative scroll-mt-24 bg-white py-24 md:py-28 overflow-hidden">
      <HueField
        blobs={[
          { hue: "sky", size: 720, top: "-25%", right: "-12%" },
          { hue: "indigo", size: 520, bottom: "-18%", left: "-8%", opacity: 0.4 },
        ]}
      />
      <div className="relative z-10 mx-auto mb-12 md:mb-14 max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Why it matters
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
            Four things move when you know why.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-500">
            Ventus is the intelligence layer between the transaction and the decision. Here's what
            changes when your teams have it.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((c, i) => (
            <div key={c.label} className={`relative min-w-0 px-5 py-14 lg:px-6 ${borderClasses[i]}`}>
              <span
                className="pointer-events-none absolute left-5 top-3 select-none text-[100px] font-bold leading-none lg:left-6 lg:text-[120px]"
                style={{ color: "rgba(37,99,235,0.08)" }}
              >
                {c.num}
              </span>
              <div className="relative z-10 pt-12">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
                  {c.label}
                </p>
                <h3 className="mb-2 text-[26px] font-bold text-gray-900 leading-tight">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
