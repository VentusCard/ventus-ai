import { useEffect, useState, useRef } from "react";

const PREFIX = "Turn transaction data into ";
const KEYWORD = "intelligence";
const TYPING_SPEED = 45;
const KEYWORD_DELAY = 200;

const AnimatedHeroTitle = () => {
  const [prefixLen, setPrefixLen] = useState(0);
  const [keywordLen, setKeywordLen] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
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
        setTimeout(typeKeyword, TYPING_SPEED);
      } else {
        setKeywordRevealed(true);
        setTimeout(() => setShowCursor(false), 800);
      }
    };

    setTimeout(typePrefix, 400);
  }, []);

  return (
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
      {PREFIX.slice(0, prefixLen)}
      {keywordLen > 0 && (
        <span
          className={`italic transition-all duration-700 ${
            keywordRevealed
              ? "text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.35)]"
              : "text-blue-600"
          }`}
          style={{
            backgroundImage: keywordRevealed
              ? "linear-gradient(135deg, #2563eb, #7c3aed, #2563eb)"
              : undefined,
            backgroundSize: keywordRevealed ? "200% auto" : undefined,
            WebkitBackgroundClip: keywordRevealed ? "text" : undefined,
            WebkitTextFillColor: keywordRevealed ? "transparent" : undefined,
            animation: keywordRevealed
              ? "shimmer-text 3s linear infinite"
              : undefined,
          }}
        >
          {KEYWORD.slice(0, keywordLen)}
        </span>
      )}
      {showCursor && (
        <span
          className="inline-block w-[3px] h-[0.85em] bg-blue-600 ml-0.5 align-text-bottom"
          style={{ animation: "blink-cursor 0.6s step-end infinite" }}
        />
      )}
    </h1>
  );
};

export default AnimatedHeroTitle;
