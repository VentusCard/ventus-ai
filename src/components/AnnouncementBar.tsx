import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const STORAGE_KEY = "ventus-announcement-bar-dismissed";

interface AnnouncementBarProps {
  onClose?: () => void;
  onHeightChange?: (height: number) => void;
}

const AnnouncementBar = ({ onClose, onHeightChange }: AnnouncementBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    setIsVisible(dismissed !== "true");
  }, []);

  useEffect(() => {
    if (!barRef.current || !isVisible) return;

    const measure = () => {
      onHeightChange?.(barRef.current?.offsetHeight ?? 40);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(barRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isVisible, onHeightChange]);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 z-[60] h-auto min-h-10 bg-blue-600 py-2 text-white sm:h-10 sm:py-0"
      role="banner"
      aria-label="Conference announcement"
    >
      <div className="relative mx-auto flex h-full min-h-[inherit] max-w-7xl items-center justify-center px-10 md:px-14">
        <p className="text-center text-sm font-medium leading-snug text-white">
          <span className="sm:hidden">
            Meet us at Finovate Fall, MoneyLIVE & Boston Fintech Week —{" "}
          </span>
          <span className="hidden sm:inline">
            Meet the Ventus team at Finovate Fall, MoneyLIVE, and Boston Fintech Week —{" "}
          </span>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 text-white underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            schedule a meeting
          </Link>
        </p>
        <button
          onClick={handleClose}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 min-w-0 min-h-0 sm:right-4 sm:h-6 sm:w-6"
        >
          <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
