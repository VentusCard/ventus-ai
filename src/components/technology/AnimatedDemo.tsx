import { useRef, useEffect } from "react";

interface AnimatedDemoProps {
  htmlContent: string;
  animationDelay?: string;
}

const AnimatedDemo = ({ htmlContent, animationDelay = '0.45s' }: AnimatedDemoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = htmlContent;

    // Manually execute script tags since innerHTML doesn't run them
    const scripts = container.querySelectorAll("script");
    const createdScripts: HTMLScriptElement[] = [];
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      newScript.textContent = oldScript.textContent;
      oldScript.remove();
      container.appendChild(newScript);
      createdScripts.push(newScript);
    });

    return () => {
      // Clear any intervals set by the scripts
      const highId = window.setInterval(() => {}, 0);
      for (let i = 0; i < 50; i++) {
        window.clearInterval(highId - i);
      }
      container.innerHTML = "";
    };
  }, [htmlContent]);

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          className="text-2xl font-semibold text-foreground mb-8 animate-fade-float"
          style={{ animationDelay, animationFillMode: 'backwards' }}
        >
          See It In Action
        </h2>
        <div
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden animate-fade-float"
          style={{
            animationDelay: `calc(${animationDelay} + 0.1s)`,
            animationFillMode: 'backwards',
            isolation: 'isolate',
          }}
        >
          <div
            className="animated-demo-scope"
            ref={containerRef}
          />
        </div>
      </div>
    </section>
  );
};

export default AnimatedDemo;
