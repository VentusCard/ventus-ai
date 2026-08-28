import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const STORAGE_KEY = "ventus-announcement-bar-dismissed";

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY) === "true";
    setIsVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-blue-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 md:px-8 min-h-[36px] md:min-h-[40px] py-1.5 md:py-2 flex items-center justify-center gap-3">
        <p className="text-xs md:text-sm text-blue-900 leading-tight">
          <span className="font-semibold">See Ventus AI live this fall</span>
          <span className="text-blue-700/80 hidden sm:inline"> — Finovate Fall, Boston Fintech Week, and MoneyLIVE 2026.</span>
          <span className="text-blue-700/80 sm:hidden"> at Finovate Fall, Boston Fintech Week, and MoneyLIVE 2026.</span>
          <Link
            to="/contact"
            className="ml-1.5 inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline whitespace-pre-wrap"
          >
            Schedule a Meeting{"\n"}
            <span aria-hidden="true" className="ml-0.5">→</span>
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-1 rounded-md text-blue-600/70 hover:text-blue-800 hover:bg-blue-100 transition-colors"
        >
          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
