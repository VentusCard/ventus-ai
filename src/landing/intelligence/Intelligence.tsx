import { useEffect, useRef, useState } from "react";
import { ChapterHeader } from "@/landing/ChapterHeader";
import { FlowPlane } from "@/landing/intelligence/FlowPlane";
import { landingCopy } from "@/landing/copy";
import { useReducedMotion } from "@/landing/useReducedMotion";

export function Intelligence() {
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<Array<HTMLElement | null>>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = stageRefs.current.findIndex((node) => node === visible.target);
        if (index >= 0) setActiveStage(index);
      },
      { rootMargin: "-34% 0px -50% 0px", threshold: [0, 0.2, 0.6] },
    );

    stageRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section id="intelligence" className="intelligence" aria-labelledby="intelligence-title">
      <div className="landing-shell">
        <div className={`intelligence__story ${reducedMotion ? "is-disabled" : ""}`}>
          <div className="intelligence__copy-column">
            <ChapterHeader
              eyebrow={landingCopy.intelligence.eyebrow}
              title={landingCopy.intelligence.title}
              body={landingCopy.intelligence.body}
              titleId="intelligence-title"
            />
            <div className="intelligence__stages">
              {landingCopy.intelligence.stages.map((stage, index) => (
                <article
                  key={stage.title}
                  ref={(node) => { stageRefs.current[index] = node; }}
                  className={activeStage === index ? "is-active" : ""}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="intelligence__sticky"><FlowPlane stage={activeStage} /></div>
        </div>

        <div className={`intelligence__static ${reducedMotion ? "is-visible" : ""}`} aria-label={landingCopy.accessibility.intelligenceStages}>
          {landingCopy.intelligence.stages.map((stage, index) => (
            <article key={stage.title}>
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </div>
              <FlowPlane stage={index} compact />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
