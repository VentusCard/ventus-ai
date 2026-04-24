import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Section 1: Next Offer ─── */
const NextOfferVisual = () => (
  <div>
    <p className="text-xs font-mono text-gray-400 mb-2">cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span></p>
    <div className="space-y-2">
      {[
        { name: "Delta SkyMiles Card", desc: "matches your travel spend", tag: "Travel & Exploration", color: "#3B82F6" },
        { name: "Whole Foods 5% Back", desc: "3x weekly grocery visits", tag: "Food & Dining", color: "#22C55E" },
        { name: "REI Co-op Card", desc: "active lifestyle detected", tag: "Sports & Fitness", color: "#F59E0B" },
      ].map((o) => (
        <div key={o.name} className="rounded-lg p-3 flex items-center gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: `3px solid ${o.color}` }}>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold truncate" style={{ fontSize: "13px" }}>{o.name}</p>
            <p className="text-gray-500 text-[11px] mt-0.5 truncate">{o.desc}</p>
          </div>
          <span className="font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0" style={{ fontSize: "11px", background: `${o.color}15`, color: o.color }}>{o.tag}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Section 2: Next Product ─── */
const NextProductVisual = () => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
      <p className="text-gray-900 text-base font-bold">New Parent</p>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600">95% confidence</span>
    </div>
    <div className="space-y-2">
      {[
        { merchant: "Buy Buy Baby", amount: "$234.50" },
        { merchant: "Pottery Barn Kids", amount: "$189.00" },
        { merchant: "Carter's", amount: "$124.50" },
      ].map((t) => (
        <div key={t.merchant} className="rounded-lg p-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #22C55E" }}>
          <p className="font-mono text-xs text-gray-600">{t.merchant} · <span className="text-gray-900 font-semibold">{t.amount}</span></p>
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-3 pt-3">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Recommended products</p>
      <div className="flex flex-wrap gap-2">
        {["529 College Savings", "Life Insurance Review", "Family Rewards Card"].map((p) => (
          <span key={p} className="text-xs text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full font-medium flex items-center gap-1">
            {p} <span className="text-blue-400">↗</span>
          </span>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Section 3: Next Conversation ─── */
const NextConversationVisual = () => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-mono text-gray-400">Advisor Alert · <span className="text-gray-900 font-semibold">cust_013</span></p>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
    </div>
    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600">College-Bound Child — 91% confidence</span>
    <div className="mt-3 space-y-2">
      {[
        "Significant college application spending detected Jan–Feb 2026",
        "Child applying to Harvard, MIT, Yale, Stanford",
        "Over $3,000 in test prep and campus visits",
      ].map((point, i) => (
        <div key={i} className="rounded-lg p-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #8B5CF6" }}>
          <p className="text-xs text-gray-700">● {point}</p>
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-3 pt-3">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Recommended action</p>
      <button className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
        Schedule college savings consultation →
      </button>
    </div>
  </div>
);

/* ─── Section 4: Portfolio Intelligence ─── */
const PortfolioVisual = () => (
  <div className="space-y-2">
    {[
      { label: "Travel & Exploration", stat: "26.9% · 14 customers", color: "#3B82F6" },
      { label: "New Parent detected", stat: "847 customers · 94% confidence", color: "#22C55E" },
      { label: "Delta Air Lines", stat: "$8,860 total spend · 13 customers", color: "#F59E0B" },
    ].map((row) => (
      <div
        key={row.label}
        className="rounded-lg p-3 flex items-center justify-between gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        style={{ borderLeft: `3px solid ${row.color}` }}
      >
        <p className="text-gray-900 font-semibold truncate" style={{ fontSize: "13px" }}>{row.label}</p>
        <p className="font-mono text-gray-500 text-[11px] whitespace-nowrap shrink-0">{row.stat}</p>
      </div>
    ))}
  </div>
);

const ROTATE_INTERVAL = 3250;

/* ─── Main Component ─── */
const SolutionSections = () => {
  const sections = useMemo(
    () => [
      {
        id: "offer-intelligence",
        label: "Next Offer",
        labelColor: "text-blue-600",
        headline: "Serve the right offer before they go looking.",
        body: "Ventus detects purchase intent from spending patterns — giving your team the signal to serve the right offer at exactly the right moment.",
        card: <NextOfferVisual />,
        link: "/solutions/offer-intelligence",
      },
      {
        id: "product-intelligence",
        label: "Next Product",
        labelColor: "text-blue-600",
        headline: "Know what your customer needs before they ask.",
        body: "Life event detection gives your team the intelligence to surface the right product at the right moment.",
        card: <NextProductVisual />,
        link: "/solutions/product-intelligence",
      },
      {
        id: "conversation-intelligence",
        label: "Next Conversation",
        labelColor: "text-blue-600",
        headline: "Turn every life event into an advisor conversation.",
        body: "Ventus detects life events in your customers transaction data and delivers structured intelligence to your CRM — who to call, why it matters, and exactly what to say.",
        card: <NextConversationVisual />,
        link: "/solutions/conversation-intelligence",
      },
      {
        id: "portfolio-intelligence",
        label: "Portfolio Intelligence",
        labelColor: "text-blue-600",
        headline: "See your entire customer base in one view.",
        body: "Bank-wide behavioral intelligence for executive teams — lifestyle distribution, life event frequency, and spending patterns, all queryable via API.",
        card: <PortfolioVisual />,
        link: "/solutions/portfolio-intelligence",
      },
    ],
    []
  );

  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const pausedElapsedRef = useRef(0);
  const rafRef = useRef<number>();

  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleSelectCard = useCallback(
    (index: number) => {
      api?.scrollTo(index);
      setActiveIndex(index);
      resetTimer();
    },
    [api, resetTimer]
  );

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      if (!prev) {
        pausedElapsedRef.current = Date.now() - startTimeRef.current;
      } else {
        startTimeRef.current = Date.now() - pausedElapsedRef.current;
      }

      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
      resetTimer();
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, resetTimer]);

  useEffect(() => {
    const tick = () => {
      if (api && !paused) {
        const elapsed = Date.now() - startTimeRef.current;

        if (elapsed >= ROTATE_INTERVAL) {
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }

          startTimeRef.current = Date.now();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [api, paused]);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-12 max-w-4xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4">Solutions</p>
            <div className="flex flex-col gap-6">
              <div className="max-w-4xl">
                <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight">
                  Powering customer intelligence at every layer.
                </h2>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {sections.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectCard(index)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                  index === activeIndex
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label={`Show ${item.label.toLowerCase()} solution`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden">
            <Carousel
              opts={{ align: "start", loop: false }}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent className="ml-0">
                {sections.map((section) => (
                  <CarouselItem key={section.id} className="pl-0 basis-full">
                    <div className="grid min-h-[560px] lg:min-h-[520px] lg:grid-cols-[1.05fr_1.2fr]">
                      <div className="flex flex-col justify-between border-b border-gray-200 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                        <div>
                          <p className={`text-[11px] font-semibold tracking-widest uppercase mb-3 ${section.labelColor}`}>
                            {section.label}
                          </p>
                          <h3 className="text-2xl md:text-[34px] font-bold text-gray-900 leading-tight mb-4">
                            {section.headline}
                          </h3>
                          <p className="text-base text-gray-500 leading-relaxed max-w-xl">
                            {section.body}
                          </p>
                        </div>

                        <div className="mt-8">
                          <Link to={section.link}>
                            <Button variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50">
                              Learn more
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-5 sm:p-6 lg:p-8">
                        <div className="h-full rounded-[20px] border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                          <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 border-b border-gray-200">
                            <span className="w-3 h-3 rounded-full bg-red-400" />
                            <span className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span className="w-3 h-3 rounded-full bg-green-400" />
                            <span className="ml-3 text-[11px] text-gray-400 font-mono">ventusai.com/solutions</span>
                          </div>
                          <div className="p-4 sm:p-5 lg:p-6 min-h-[340px]">
                            {section.card}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
              <div className="mt-4 flex items-center justify-center gap-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSelectCard(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === activeIndex ? "h-3 w-8 bg-blue-600" : "h-3 w-3 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to ${section.label.toLowerCase()} card`}
                  />
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePause}
                  className="w-fit"
                  aria-label={paused ? "Resume solution carousel" : "Pause solution carousel"}
                >
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {paused ? "Resume" : "Pause"}
                </Button>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SolutionSections;
