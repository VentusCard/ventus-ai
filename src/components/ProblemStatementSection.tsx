import { useEffect, useRef, useState } from "react";

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
      { threshold: 0.2 }
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
              Behind every transaction is a person. The data just doesn't show it.
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
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementSection;