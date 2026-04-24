import { useEffect, useRef, useState } from "react";

const interpolateColor = (progress: number) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const start = { r: 17, g: 24, b: 39 };
  const end = { r: 37, g: 99, b: 235 };

  const r = Math.round(start.r + (end.r - start.r) * clamped);
  const g = Math.round(start.g + (end.g - start.g) * clamped);
  const b = Math.round(start.b + (end.b - start.b) * clamped);

  return `rgb(${r}, ${g}, ${b})`;
};

const ProblemStatementSection = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [headlineColor, setHeadlineColor] = useState("rgb(17, 24, 39)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const updateHeadlineColor = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const startPoint = viewportHeight * 1.02;
      const endPoint = viewportHeight * 0.32;
      const progress = (startPoint - rect.top) / (startPoint - endPoint);

      setHeadlineColor(interpolateColor(progress));
      frame = 0;
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHeadlineColor);
    };

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
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section ref={ref} style={{ paddingTop: 160, paddingBottom: 160 }} className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        <div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight">
            <span
              className="block"
              style={{
                opacity: visible ? 1 : 0,
                color: headlineColor,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out, color 320ms ease-out",
              }}
            >
              Behind every customer's transaction history is a person. The data just doesn't show it.
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