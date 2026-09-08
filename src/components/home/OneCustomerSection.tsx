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
  <div className="w-full max-w-sm rounded-lg border border-slate-300 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Customer record
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">Morgan Ellis</p>
      <p className="mt-0.5 text-[11px] text-slate-400">Austin, TX · Age 34-40</p>
    </div>
    <dl className="divide-y divide-slate-200 text-[12px]">
      {[
        ["Tier", "Preferred"],
        ["Tenure", "6 years"],
        ["Relationship value", "$60k-$90k"],
        ["Product 1", "Checking"],
        ["Product 2", "Rewards Card"],
        ["Product 3", "Auto Loan"],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center justify-between px-4 py-2">
          <dt className="text-slate-400">{k}</dt>
          <dd className="font-medium text-slate-600">{v}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const PhoneSurface = () => (
  <div className="w-[210px] rounded-[26px] border border-slate-300 bg-white p-2.5 shadow-lg">
    <div className="rounded-[18px] bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">For you</p>
      <div className="mt-3 space-y-2.5">
        {OFFERS.map((offer) => (
          <div key={offer.title} className="rounded-lg border border-slate-200 bg-white p-2.5">
            <p className="text-[11px] font-semibold text-slate-700">{offer.title}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{offer.detail}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EmailSurface = () => (
  <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
      <Mail className="h-4 w-4 text-blue-600" />
      <p className="text-sm font-semibold text-slate-700">
        Your book this week: 1 household to reach
      </p>
    </div>
    <div className="grid grid-cols-3 gap-3 px-4 py-3 text-[11px]">
      <div>
        <p className="text-slate-400">Signal</p>
        <p className="mt-0.5 font-medium text-slate-700">New baby at home</p>
      </div>
      <div>
        <p className="text-slate-400">Best-fit product</p>
        <p className="mt-0.5 font-medium text-slate-700">Family-tier rewards upgrade</p>
      </div>
      <div>
        <p className="text-slate-400">Outreach window</p>
        <p className="mt-0.5 font-medium text-slate-700">Next 14 days</p>
      </div>
    </div>
  </div>
);

const SignalPill = ({
  signal,
  visible,
  index,
}: {
  signal: (typeof SIGNALS)[number];
  visible: boolean;
  index: number;
}) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-500 ${signal.tone} ${
      visible ? `${BAND_OPACITY[signal.band]} translate-y-0` : "translate-y-2 opacity-0"
    }`}
    style={{ transitionDelay: `${index * 70}ms` }}
  >
    {signal.label}
    <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
      {signal.band}
    </span>
  </span>
);

const BeatVisual = ({ beat }: { beat: number }) => (
  <div className="relative flex min-h-[420px] w-full items-center justify-center">
    {/* signals layer */}
    <div
      className={`absolute inset-x-0 top-0 flex flex-wrap justify-center gap-2 transition-opacity duration-500 ${
        beat >= 1 ? (beat >= 2 ? "opacity-45" : "opacity-100") : "opacity-0"
      }`}
    >
      {SIGNALS.map((signal, index) => (
        <SignalPill key={signal.label} signal={signal} visible={beat >= 1} index={index} />
      ))}
    </div>

    <div
      className={`absolute transition-all duration-500 ${
        beat <= 1 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${beat === 1 ? "mt-28" : ""}`}
    >
      <ColdRecord />
    </div>

    <div
      className={`absolute flex flex-col items-center gap-3 transition-all duration-500 ${
        beat === 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-800">
        <Sparkles className="h-3 w-3" />
        New baby at home
      </span>
      <span className="h-6 w-px bg-violet-300" />
      <PhoneSurface />
    </div>

    <div
      className={`absolute w-full max-w-md space-y-3 transition-all duration-500 ${
        beat === 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {PRODUCTS.map(({ signal, product, icon: Icon }) => (
        <div
          key={product}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{signal}</p>
            <p className="text-[13px] font-medium leading-snug text-slate-700">{product}</p>
          </div>
        </div>
      ))}
    </div>

    <div
      className={`absolute transition-all duration-500 ${
        beat === 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <EmailSurface />
    </div>
  </div>
);

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
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
        One customer
      </p>
      <h2 className="mt-3 max-w-md text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
        Six years of history. Three products. And no idea who she is.
      </h2>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
        Morgan Ellis · Austin, TX · 6 years with the bank · Preferred tier · Checking, Rewards Card,
        Auto Loan · $60k-$90k relationship value
      </p>
    </div>
  );

  if (!pinned) {
    return (
      <section id="one-customer" className="scroll-mt-24 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-8">
          {framing}
          {BEATS.map((item, index) => (
            <div key={item.eyebrow} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
                {item.eyebrow}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              <div className="mt-5 flex justify-center">
                <BeatVisual beat={index} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="one-customer" className="scroll-mt-24 bg-white">
      <div ref={trackRef} className="relative h-[500vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-2">
            <div>
              {framing}
              <div className="relative mt-8 h-32">
                {BEATS.map((item, index) => (
                  <div
                    key={item.eyebrow}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      beat === index ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {String(index + 1).padStart(2, "0")} · {item.eyebrow}
                    </p>
                    <p className="mt-2 max-w-md text-base leading-relaxed text-slate-600">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-1.5">
                {BEATS.map((item, index) => (
                  <span
                    key={item.eyebrow}
                    className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                      beat >= index ? "bg-blue-600" : "bg-slate-200"
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
