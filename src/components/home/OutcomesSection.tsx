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
    <section id="outcomes" className="relative scroll-mt-24 bg-white py-16 md:py-20 overflow-hidden">
      <HueField
        blobs={[
          { hue: "sky", size: 640, top: "-22%", right: "-10%" },
          { hue: "indigo", size: 460, bottom: "-16%", left: "-8%", opacity: 0.35 },
        ]}
      />
      <div className="relative z-10 mx-auto mb-10 max-w-6xl px-6 md:px-8">
        <ScrollReveal>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
            Why it matters
          </p>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
            Four things move when you know why.
          </h2>
          <p className="mt-3 max-w-3xl text-base text-gray-500">
            Ventus is the intelligence layer between the transaction and the decision. Here's what
            changes when your teams have it.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((c, i) => (
            <div key={c.label} className={`relative min-w-0 px-4 py-10 lg:px-5 ${borderClasses[i]}`}>
              <span
                className="pointer-events-none absolute left-4 top-2 select-none text-[72px] font-bold leading-none lg:left-5 lg:text-[90px]"
                style={{ color: "rgba(37,99,235,0.07)" }}
              >
                {c.num}
              </span>
              <div className="relative z-10 pt-10">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
                  {c.label}
                </p>
                <h3 className="mb-2 text-xl font-bold text-gray-900 leading-tight">
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
