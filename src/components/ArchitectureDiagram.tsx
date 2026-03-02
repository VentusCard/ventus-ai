import { useEffect, useRef, useState } from "react";

const pillars = [
  {
    title: "Analytics & Targeting",
    color: "#4f46e5",
    existing: ["BI Dashboards", "Segment Tools", "Data Warehouse"],
    ventus: [
      "Persona Dashboards",
      "Behavioral Segmentation",
      "Smart Budgeting Tools",
      "Targeted Campaigns",
    ],
  },
  {
    title: "Rewards & Deals",
    color: "#059669",
    existing: [
      "Card Reward Programs",
      "Reward Aggregators (CardLinx / Figg)",
      "Partner Portals",
    ],
    ventus: [
      "Lifestyle-Matched Offers",
      "Real-Time Deal Matching",
      "Personalized Rewards Experience",
    ],
  },
  {
    title: "Wealth & Relationship",
    color: "#d97706",
    existing: ["Salesforce / HubSpot", "Planning Software (eMoney)"],
    ventus: [
      "Connect External Accounts at Other Banks",
      "Holistic Budgeting",
      "Proactive Life Event Alerts",
      "WM CoPilot Suite",
      "Automated Meeting Prep",
    ],
  },
];

const outcomes = [
  "Next Gen UX",
  "Lifestyle Budgeting",
  "Personalized Rewards",
  "Relationship Intelligence",
];

function useScrollVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const stagger = (visible: boolean, delay: number) =>
  ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
  }) as React.CSSProperties;

const ConnectorLine = ({
  visible,
  delay,
  height = 40,
}: {
  visible: boolean;
  delay: number;
  height?: number;
}) => (
  <div className="flex flex-col items-center" style={{ height }}>
    <div
      className="w-px flex-1"
      style={{
        background: "#2563eb",
        transformOrigin: "top",
        transform: visible ? "scaleY(1)" : "scaleY(0)",
        transition: `transform 0.5s ease-out ${delay}s`,
      }}
    />
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "6px solid #2563eb",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.3s ease-out ${delay + 0.4}s`,
      }}
    />
  </div>
);

const ArchitectureDiagram = () => {
  const { ref, visible } = useScrollVisible(0.1);

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-14" style={stagger(visible, 0)}>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-3xl mx-auto">
            A modular intelligence layer that works with{" "}
            <span className="text-blue-600">your existing stack.</span>
          </h2>
        </div>

        {/* Bank Partner Database */}
        <div className="flex flex-col items-center">
          <div
            className="rounded-xl border border-gray-200 bg-gray-50 px-8 py-4 text-center shadow-sm"
            style={stagger(visible, 0.15)}
          >
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Bank Partner Database
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Existing Transaction Data
            </p>
          </div>

          <ConnectorLine visible={visible} delay={0.3} />

          {/* Ventus Suite bar */}
          <div
            className="w-full max-w-md rounded-lg py-3 px-6 text-center shadow-md"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              ...stagger(visible, 0.45),
            }}
          >
            <p className="text-white font-bold tracking-wide text-sm uppercase">
              Ventus Suite
            </p>
          </div>

          {/* Branch connector */}
          <div className="hidden md:flex w-full max-w-4xl justify-between relative" style={{ height: 40 }}>
            {/* Horizontal line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
              style={{
                width: visible ? "66%" : "0%",
                background: "#2563eb",
                transition: `width 0.5s ease-out 0.6s`,
              }}
            />
            {/* Three vertical drops */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 flex justify-center"
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-px"
                    style={{
                      height: 34,
                      background: "#2563eb",
                      transformOrigin: "top",
                      transform: visible ? "scaleY(1)" : "scaleY(0)",
                      transition: `transform 0.4s ease-out ${0.7 + i * 0.1}s`,
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "5px solid #2563eb",
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.3s ease-out ${0.9 + i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile single connector */}
          <div className="md:hidden">
            <ConnectorLine visible={visible} delay={0.6} height={30} />
          </div>

          {/* Three Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-2">
            {pillars.map((pillar, pi) => (
              <div
                key={pillar.title}
                className="flex flex-col gap-3"
                style={stagger(visible, 0.85 + pi * 0.15)}
              >
                {/* Pillar title */}
                <div className="text-center">
                  <p
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: pillar.color }}
                  >
                    {pillar.title}
                  </p>
                </div>

                {/* Existing Stack */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">
                    Existing Stack
                  </p>
                  <ul className="space-y-1.5">
                    {pillar.existing.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-gray-500 flex items-start gap-2"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ventus addition */}
                <div
                  className="rounded-xl p-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${pillar.color}ee, ${pillar.color}cc)`,
                    ...stagger(visible, 1.1 + pi * 0.15),
                  }}
                >
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 opacity-70">
                    + Ventus
                  </p>
                  <ul className="space-y-1.5">
                    {pillar.ventus.map((item) => (
                      <li
                        key={item}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mobile connector between pillars */}
                {pi < 2 && (
                  <div className="md:hidden flex justify-center py-1">
                    <div className="h-6 w-px bg-gray-200" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom connectors */}
          <div className="hidden md:flex w-full max-w-4xl justify-between relative" style={{ height: 40 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 flex justify-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-px"
                    style={{
                      height: 34,
                      background: "#f59e0b",
                      transformOrigin: "top",
                      transform: visible ? "scaleY(1)" : "scaleY(0)",
                      transition: `transform 0.4s ease-out ${1.4 + i * 0.1}s`,
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "5px solid #f59e0b",
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.3s ease-out ${1.6 + i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Horizontal merge line */}
            <div
              className="absolute bottom-[6px] left-1/2 -translate-x-1/2 h-px"
              style={{
                width: visible ? "66%" : "0%",
                background: "#f59e0b",
                transition: `width 0.5s ease-out 1.5s`,
              }}
            />
          </div>

          <div className="md:hidden">
            <ConnectorLine visible={visible} delay={1.4} height={30} />
          </div>

          {/* Personalized Banking Experience */}
          <div
            className="w-full rounded-xl py-5 px-6 text-center shadow-md"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              ...stagger(visible, 1.6),
            }}
          >
            <p className="text-white font-bold text-sm uppercase tracking-widest mb-3">
              Personalized Banking Experience
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {outcomes.map((o) => (
                <span
                  key={o}
                  className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureDiagram;
