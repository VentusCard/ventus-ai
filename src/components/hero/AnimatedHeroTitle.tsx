import { useEffect, useState, useRef } from "react";

const PREFIX = "";
const KEYWORD = "Autonomous intelligence";
const SUFFIX = " from transaction data.";

const AnimatedHeroTitle = ({ onComplete }: { onComplete?: () => void }) => {
  const [keywordLen, setKeywordLen] = useState(0);
  const [showSuffix, setShowSuffix] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let j = 0;
    const typeKeyword = () => {
      if (j < KEYWORD.length) {
        j++;
        setKeywordLen(j);
        setTimeout(typeKeyword, 28);
      } else {
        setTimeout(() => {
          setShowSuffix(true);
          setTimeout(() => {
            setHighlight(true);
            onComplete?.();
          }, 300);
        }, 100);
      }
    };

    setTimeout(typeKeyword, 300);
  }, []);

  return (
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
      {keywordLen > 0 && (
        <span
          className={`italic transition-colors duration-500 ${
            highlight ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {KEYWORD.slice(0, keywordLen)}
        </span>
      )}
      {showSuffix && SUFFIX}
    </h1>
  );
};
