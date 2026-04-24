import { useEffect, useRef, useState } from "react";

const headlineWords = [
  "Behind",
  "every",
  "customer's",
  "transaction",
  "history",
  "is",
  "a",
  "person.",
  "The",
  "data",
  "just",
  "doesn't",
  "show",
  "it.",
];

const ProblemStatementSection = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45, rootMargin: "-15% 0px -15% 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ paddingTop: 120, paddingBottom: 120 }} className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        <div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight">
            <span
              className="block"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
              }}
            >
              {headlineWords.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="inline-block"
                  style={{
                    color: visible ? "#2563EB" : undefined,
                    transition: `color 800ms ease-out ${index * 55}ms`,
                    marginRight: index === headlineWords.length - 1 ? 0 : "0.28em",
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </h2>
          <p
            className="mt-4 text-base text-gray-500 max-w-4xl mx-auto leading-relaxed"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 400ms ease-out 800ms, transform 400ms ease-out 800ms",
            }}
          >
            Fragmented rails, vague MCCs, and no behavioral layer — that's why banking personalization fails.
          </p>
          <p
            className="mt-5 max-w-4xl mx-auto text-center italic"
            style={{
              color: "#2563EB",
              fontSize: 18,
              fontWeight: 500,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 400ms ease-out 1200ms, transform 400ms ease-out 1200ms",
            }}
          >
            Ventus is the behavioral intelligence layer that bridges the gap.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementSection;