import { useEffect, useState, useRef } from "react";

const PREFIX = "Turn transaction data into ";
const KEYWORD = "intelligence";
const TYPING_SPEED = 40;
const KEYWORD_DELAY = 150;

const AnimatedHeroTitle = () => {
  const [prefixLen, setPrefixLen] = useState(0);
  const [keywordLen, setKeywordLen] = useState(0);
  const [keywordRevealed, setKeywordRevealed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let i = 0;
    const typePrefix = () => {
      if (i < PREFIX.length) {
        i++;
        setPrefixLen(i);
        setTimeout(typePrefix, TYPING_SPEED);
      } else {
        setTimeout(typeKeyword, KEYWORD_DELAY);
      }
    };

    let j = 0;
    const typeKeyword = () => {
      if (j < KEYWORD.length) {
        j++;
        setKeywordLen(j);
        setTimeout(typeKeyword, 30);
      } else {
        setKeywordRevealed(true);
      }
    };

    setTimeout(typePrefix, 400);
  }, []);

  return (
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
      {PREFIX.slice(0, prefixLen)}
      {prefixLen < PREFIX.length && (
        <span
          className="inline-block w-[3px] h-[0.85em] bg-gray-900 ml-0.5 align-text-bottom"
          style={{ animation: "blink-cursor 0.6s step-end infinite" }}
        />
      )}
      {keywordLen > 0 && (
        <span
          className={`italic text-blue-600 transition-all duration-500 ${
            keywordRevealed ? "drop-shadow-[0_0_24px_rgba(37,99,235,0.3)]" : ""
          }`}
        >
          {KEYWORD.slice(0, keywordLen)}
        </span>
      )}
    </h1>
  );
};

export default AnimatedHeroTitle;
