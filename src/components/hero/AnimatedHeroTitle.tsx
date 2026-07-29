import { useEffect } from "react";

const AnimatedHeroTitle = ({ onComplete }: { onComplete?: () => void }) => {
  useEffect(() => {
    onComplete?.();
  }, [onComplete]);

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
      Turn transaction data into{" "}
      <span className="italic text-blue-600">behavioral intelligence</span>
    </h1>
  );
};

export default AnimatedHeroTitle;
