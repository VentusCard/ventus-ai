import { useEffect, useState, useRef } from "react";

const PREFIX = "Turn transaction data into ";
const KEYWORD = "intelligence";

const AnimatedHeroTitle = () => {
  const [prefixLen, setPrefixLen] = useState(0);
  const [keywordLen, setKeywordLen] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let i = 0;
    const typePrefix = () => {
      if (i < PREFIX.length) {
        i++;
        setPrefixLen(i);
        setTimeout(typePrefix, 28);
      } else {
        setTimeout(typeKeyword, 100);
      }
    };

    let j = 0;
    const typeKeyword = () => {
      if (j < KEYWORD.length) {
        j++;
        setKeywordLen(j);
        setTimeout(typeKeyword, 22);
      } else {
        setTimeout(() => setHighlight(true), 300);
      }
    };

    setTimeout(typePrefix, 300);
  }, []);

  return (
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
      {PREFIX.slice(0, prefixLen)}
      {keywordLen > 0 && (
        <span
          className={`italic transition-colors duration-500 ${
            highlight ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {KEYWORD.slice(0, keywordLen)}
        </span>
      )}
    </h1>
  );
};

export default AnimatedHeroTitle;
