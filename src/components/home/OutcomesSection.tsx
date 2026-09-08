import { useEffect, useRef, useState } from "react";
import HueField from "@/components/HueField";

const cards = [
  {
    label: "CARD SPEND",
    title: "More card spend.",
    body: "When the offer matches what someone actually buys, they put more on your card instead of someone else's. That's interchange you're currently giving away.",
    accent: "bg-blue-500",
    labelColor: "text-blue-600",
  },
  {
    label: "PRODUCT GROWTH",
    title: "More products per customer.",
    body: "Life events are the moment a product becomes relevant. Detect the moment and you're the bank that showed up first.",
    accent: "bg-indigo-500",
    labelColor: "text-indigo-600",
  },
  {
    label: "DEPOSITS",
    title: "More deposits.",
    body: "Idle cash sitting at another institution is visible in the data. So is the moment a customer starts shopping for yield.",
    accent: "bg-cyan-500",
    labelColor: "text-cyan-600",
  },
  {
    label: "RETENTION",
    title: "Fewer customers leaving.",
    body: "Behavioral change shows up before attrition does. Engage at the signal, not at the exit interview.",
    accent: "bg-slate-500",
    labelColor: "text-slate-600",
  },
];

const OutcomesSection = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setSettled(true), 3 * 90 + 650);
    return () => clearTimeout(t);
  }, [revealed]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="outcomes"
      className="relative scroll-mt-24 overflow-hidden bg-white py-24 md:py-40"
    >
      <HueField
        blobs={[
          { hue: "sky", size: 640, top: "-22%", right: "-10%" },
          { hue: "indigo", size: 460, bottom: "-16%", left: "-8%", opacity: 0.35 },
        ]}
      />
      <div className="relative z-10 mx-auto mb-14 max-w-6xl px-6 md:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
          Why it matters
        </p>
        <h2 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-[54px] md:leading-[1.08]">
          Four metrics that move.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
          Ventus sits between the transaction and the decision. These are the numbers that change
          once your teams have it.
        </p>
      </div>

      <div ref={gridRef} className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <div
              key={c.label}
              className="rounded-[20px] border border-gray-200 bg-white p-7 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.12)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_28px_64px_-24px_rgba(15,23,42,0.2)]"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 90}ms, transform 0.6s ease ${i * 90}ms, box-shadow 150ms ease`,
              }}
            >
              <div className={`mb-5 h-1 w-10 rounded-full ${c.accent}`} />
              <p
                className={`mb-2 text-[11px] font-semibold uppercase tracking-widest ${c.labelColor}`}
              >
                {c.label}
              </p>
              <h3 className="mb-3 text-xl font-bold leading-tight text-gray-900">{c.title}</h3>
              <p className="text-base leading-[1.65] text-gray-600">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
