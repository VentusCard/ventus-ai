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
    accent: "bg-blue-500",
    labelColor: "text-blue-600",
  },
  {
    label: "DEPOSITS",
    title: "More deposits.",
    body: "Idle cash sitting at another institution is visible in the data. So is the moment a customer starts shopping for yield.",
    accent: "bg-blue-500",
    labelColor: "text-blue-600",
  },
  {
    label: "RETENTION",
    title: "Fewer customers leaving.",
    body: "Behavioral change shows up before attrition does. Engage at the signal, not at the exit interview.",
    accent: "bg-blue-500",
    labelColor: "text-blue-600",
  },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const Header = () => (
  <div className="relative z-10 mx-auto mb-14 max-w-7xl px-6 md:px-8">
    <p className="mb-2 text-left text-[11px] font-semibold uppercase tracking-widest text-blue-600">
      The Results
    </p>
    <h2 className="text-left max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-[54px] md:leading-[1.08]">
      Four metrics that move.
    </h2>
    <p className="mt-4 max-w-3xl text-left text-lg leading-[1.65] text-gray-700">
      Ventus sits between the transaction and the decision. These are the numbers that change
      once your teams have it.
    </p>
  </div>
);

const CardGrid = ({
  cardRefs,
  staticVersion = false,
}: {
  cardRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
  staticVersion?: boolean;
}) => (
  <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          ref={cardRefs ? (node) => (cardRefs.current[i] = node) : undefined}
          className="rounded-[20px] border border-gray-200 bg-white p-7 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.12)] transition-transform duration-150 hover:-translate-y-px hover:shadow-[0_28px_64px_-24px_rgba(15,23,42,0.2)]"
          style={staticVersion ? undefined : { opacity: 0, transform: "translateY(28px)" }}
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
);

const OutcomesSection = () => {
  const trackRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    setPinEnabled(!reduced && wide);
  }, []);

  useEffect(() => {
    if (!pinEnabled) return;
    let frameId = 0;

    const update = () => {
      frameId = requestAnimationFrame(update);
      const track = trackRef.current;
      if (!track) return;

      const bounds = track.getBoundingClientRect();
      const distance = bounds.height - window.innerHeight;
      const progress = clamp(distance > 0 ? -bounds.top / distance : 0);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const local = ease((progress - index * 0.2) / 0.18);
        card.style.opacity = String(local);
        card.style.transform = `translateY(${(1 - local) * 28}px)`;
      });
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [pinEnabled]);

  if (!pinEnabled) {
    return (
      <section id="outcomes" className="relative scroll-mt-[96px] overflow-hidden bg-white py-24">
        <HueField
          blobs={[
            { hue: "sky", size: 640, top: "-22%", right: "-10%" },
            { hue: "indigo", size: 460, bottom: "-16%", left: "-8%", opacity: 0.35 },
          ]}
        />
        <Header />
        <CardGrid staticVersion />
      </section>
    );
  }

  return (
    <section
      id="outcomes"
      ref={trackRef}
      className="relative h-[320vh] scroll-mt-[96px] bg-white"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <HueField
          blobs={[
            { hue: "sky", size: 640, top: "-22%", right: "-10%" },
            { hue: "indigo", size: 460, bottom: "-16%", left: "-8%", opacity: 0.35 },
          ]}
        />
        <Header />
        <CardGrid cardRefs={cardRefs} />
        <div className="relative z-10 mx-auto mt-12 w-full max-w-7xl px-6 md:px-8">
          <div className="h-px w-32 overflow-hidden bg-gray-200">
            <div
              ref={progressRef}
              className="h-px w-full origin-left bg-blue-500"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
