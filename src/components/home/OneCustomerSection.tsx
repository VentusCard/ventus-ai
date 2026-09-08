import { useEffect, useRef, useState } from "react";
import { Baby, Car, GraduationCap, Mail, Sparkles } from "lucide-react";

const BEATS = [
  {
    eyebrow: "What the bank sees today",
    copy: "Today Morgan is a tier, a tenure, and three product codes. Everything that would tell you what she needs next is sitting in her account, unread.",
  },
  {
    eyebrow: "The signals resolve",
    copy: "Ventus reads the same account and finds seven signals across four families. Each one carries its own confidence.",
  },
  {
    eyebrow: "Her app changes",
    copy: "The offers in her app stop being generic. They reflect a household that just got bigger.",
  },
  {
    eyebrow: "The right product, offered once",
    copy: "Three products become relevant at once. Not because of a campaign calendar, because of what changed in her life.",
  },
  {
    eyebrow: "Her banker already knows",
    copy: "And the colleague who owns the relationship gets it as an email, before Morgan ever calls.",
  },
];

type Band = "Strong" | "Likely" | "Emerging";

const SIGNALS: { family: string; label: string; band: Band; tone: string }[] = [
  {
    family: "Life Event",
    label: "New baby at home",
    band: "Strong",
    tone: "border-violet-300 bg-violet-50 text-violet-800",
  },
  {
    family: "Financial",
    label: "Auto loan servicing",
    band: "Strong",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  {
    family: "Behavioral",
    label: "Weeknight delivery habit",
    band: "Strong",
    tone: "border-sky-300 bg-sky-50 text-sky-800",
  },
  {
    family: "Demographic",
    label: "Dual-income household",
    band: "Strong",
    tone: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    family: "Financial",
    label: "Retirement contributions",
    band: "Likely",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  {
    family: "Behavioral",
    label: "Warehouse bulk shopper",
    band: "Likely",
    tone: "border-sky-300 bg-sky-50 text-sky-800",
  },
  {
    family: "Life Event",
    label: "Household move planning",
    band: "Emerging",
    tone: "border-violet-300 bg-violet-50 text-violet-800",
  },
];

const OFFERS = [
  { title: "Family essentials cash back", detail: "Boosted rate on everyday household spend" },
  { title: "Bulk shopping perk", detail: "Extra rewards at warehouse retailers" },
  { title: "Delivery credit", detail: "Monthly credit on food delivery" },
];

const PRODUCTS = [
  {
    signal: "New baby at home",
    product: "Family-tier rewards upgrade on the primary card",
    icon: Baby,
  },
  {
    signal: "Auto loan servicing",
    product: "Pre-approved auto refinance ahead of renewal",
    icon: Car,
  },
  {
    signal: "New baby at home",
    product: "Education savings starter conversation",
    icon: GraduationCap,
  },
];

const BAND_OPACITY: Record<Band, string> = {
  Strong: "opacity-100",
  Likely: "opacity-90",
  Emerging: "opacity-70",
};

const ColdRecord = () => (
  <div className="w-full rounded-[20px] border border-slate-300 bg-slate-50">
    <div className="border-b border-slate-300 bg-slate-100 px-6 py-5">
      <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">
        Customer record
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-800">Morgan Ellis</p>
      <p className="mt-1 text-[14px] font-medium text-slate-600">Austin, TX · Age 34-40</p>
    </div>
    <dl className="divide-y divide-slate-200 text-[15px]">
      {[
        ["Tier", "Preferred"],
        ["Tenure", "6 years"],
        ["Relationship value", "$60k-$90k"],
        ["Product 1", "Checking"],
        ["Product 2", "Rewards Card"],
        ["Product 3", "Auto Loan"],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center justify-between px-6 py-3.5">
          <dt className="text-slate-500">{k}</dt>
          <dd className="font-medium text-slate-700">{v}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const PhoneSurface = () => (
  <div className="w-[290px] rounded-[32px] border border-slate-300 bg-white p-3 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)]">
    <div className="rounded-[24px] bg-slate-50 p-4">
      <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">For you</p>
      <div className="mt-4 space-y-3">
        {OFFERS.map((offer) => (
          <div key={offer.title} className="rounded-[14px] border border-slate-200 bg-white p-3.5">
            <p className="text-[15px] font-semibold text-slate-800">{offer.title}</p>
            <p className="mt-1 text-[13px] leading-snug text-slate-600">{offer.detail}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EmailSurface = () => (
  <div className="w-full rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]">
    <div className="flex items-center gap-2.5 border-b border-slate-200 px-6 py-4">
      <Mail className="h-5 w-5 text-blue-600" />
      <p className="text-[16px] font-semibold text-slate-900">
        Your book this week: 1 household to reach
      </p>
    </div>
    <div className="grid grid-cols-3 gap-4 px-6 py-5 text-[14px]">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Signal</p>
        <p className="mt-1 font-medium text-slate-800">New baby at home</p>
      </div>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Best-fit product</p>
        <p className="mt-1 font-medium text-slate-800">Family-tier rewards upgrade</p>
      </div>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Outreach window</p>
        <p className="mt-1 font-medium text-slate-800">Next 14 days</p>
      </div>
    </div>
  </div>
);

const SignalPill = ({
  signal,
  visible,
  index,
  dimmed,
  highlighted,
}: {
  signal: (typeof SIGNALS)[number];
  visible: boolean;
  index: number;
  dimmed: boolean;
  highlighted: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[14px] font-medium transition-all duration-500 ${signal.tone} ${
      visible
        ? dimmed && !highlighted
          ? "translate-y-0 scale-[0.85] opacity-40"
          : `translate-y-0 scale-100 ${BAND_OPACITY[signal.band]}`
        : "translate-y-2 scale-95 opacity-0"
    }`}
    style={{ transitionDelay: `${index * 70}ms` }}
  >
    {signal.label}
    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] uppercase tracking-wide">
      {signal.band}
    </span>
  </span>
);

const HIGHLIGHT_LABEL = "New baby at home";

const BeatVisual = ({ beat }: { beat: number }) => {
  const pillsVisible = beat >= 1;
  const dimmed = beat >= 2;

  return (
    <div className="flex min-h-[70vh] w-full flex-col">
      {/* TOP ZONE: pills only */}
      <div className="flex h-[120px] shrink-0 flex-wrap content-start justify-center gap-2 overflow-hidden">
        {SIGNALS.map((signal, index) => (
          <SignalPill
            key={signal.label}
            signal={signal}
            visible={pillsVisible}
            index={index}
            dimmed={dimmed}
            highlighted={signal.label === HIGHLIGHT_LABEL}
          />
        ))}
      </div>

      {/* GAP */}
      <div className="h-8 shrink-0" />

      {/* BOTTOM ZONE: current beat surface */}
      <div className="relative min-h-0 flex-1">
        <div
          className={`absolute inset-x-0 bottom-0 flex items-start justify-center transition-all duration-500 ${
            beat === 0 ? "top-[-152px]" : "top-0"
          } ${beat <= 1 ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ColdRecord />
        </div>


        <div
          className={`absolute inset-0 flex items-start justify-center transition-opacity duration-500 ${
            beat === 2 ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <PhoneSurface />
        </div>

        <div
          className={`absolute inset-0 flex flex-col justify-start gap-4 transition-opacity duration-500 ${
            beat === 3 ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {PRODUCTS.map(({ signal, product, icon: Icon }) => (
            <div
              key={product}
              className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white px-6 py-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.15)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">{signal}</p>
                <p className="mt-0.5 text-[16px] font-medium leading-snug text-slate-800">{product}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`absolute inset-0 flex items-start transition-opacity duration-500 ${
            beat === 4 ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <EmailSurface />
        </div>
      </div>
    </div>
  );
};


const OneCustomerSection = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(media.matches && !motion.matches);
    update();
    media.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        setBeat(Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pinned]);

  const framing = (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
        One customer
      </p>
      <h2 className="mt-3 max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-[34px]">
        Six years of history. Three products. And no idea who she is.
      </h2>
      <p className="mt-4 max-w-xl text-[15px] font-medium leading-[1.65] text-slate-600">
        Morgan Ellis · Austin, TX · 6 years with the bank · Preferred tier · Checking, Rewards Card,
        Auto Loan · $60k-$90k relationship value
      </p>
    </div>
  );

  if (!pinned) {
    return (
      <section id="one-customer" className="scroll-mt-[96px] bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl space-y-10 px-6 md:px-8">
          {framing}
          {BEATS.map((item, index) => (
            <div
              key={item.eyebrow}
              className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.12)]"
            >
              <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
                {item.eyebrow}
              </p>
              <p className="mt-2 text-base leading-[1.65] text-slate-700">{item.copy}</p>
              <div className="mt-6 flex justify-center">
                <BeatVisual beat={index} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="one-customer" className="scroll-mt-[96px] bg-white">
      <div ref={trackRef} className="relative h-[500vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-20">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-12 px-6 md:px-8 lg:grid-cols-2">
            <div className="pt-2">
              {framing}
              <div className="relative mt-8 h-36">
                {BEATS.map((item, index) => (
                  <div
                    key={item.eyebrow}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      beat === index ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <p className="text-[12px] font-bold uppercase tracking-widest text-slate-700">
                      {String(index + 1).padStart(2, "0")} · {item.eyebrow}
                    </p>
                    <p className="mt-2.5 max-w-xl text-base leading-[1.65] text-slate-700">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                {BEATS.map((item, index) => (
                  <span
                    key={item.eyebrow}
                    className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${
                      beat >= index ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <BeatVisual beat={beat} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OneCustomerSection;
