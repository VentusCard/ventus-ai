import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface Step {
  label: string;
  desc: string;
}

interface StepFlowProps {
  steps: Step[];
  title: string;
}

const StepFlow = ({ steps, title }: StepFlowProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="font-bold text-gray-900 mb-12 text-center" style={{ fontSize: 36 }}>
        {title}
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {steps.map((step, i) => {
          const isActive = i === activeIndex;
          return (
            <div key={step.label} className="flex items-center gap-4">
                <div
                  className="flex flex-col items-center justify-center text-center"
                  style={{
                    width: 200,
                    height: 120,
                    borderRadius: 12,
                    border: `1px solid ${isActive ? "#2563EB" : "#E5E7EB"}`,
                    backgroundColor: isActive ? "#EFF6FF" : "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    padding: "16px 12px",
                    transition: "all 0.4s ease",
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center bg-blue-600 text-white text-xs font-bold mb-2 flex-shrink-0 leading-none"
                    style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, borderRadius: 9999, aspectRatio: "1 / 1" }}
                  >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{step.label}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={18} className="text-blue-500 hidden md:block flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepFlow;
