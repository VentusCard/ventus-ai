import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const STORAGE_KEY = "ventus-announcement-bar-dismissed";

interface AnnouncementBarProps {
  onClose?: () => void;
}

const AnnouncementBar = ({ onClose }: AnnouncementBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    setIsVisible(dismissed !== "true");
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-10 bg-blue-600 text-white"
      role="banner"
      aria-label="Conference announcement"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <span className="hidden sm:block" aria-hidden="true" />
        <p className="flex-1 text-center text-sm font-medium sm:flex-none sm:text-left">
          Meet the Ventus team at Finovate Fall, MoneyLIVE, and Boston Fintech Week{" "}
          <span className="hidden sm:inline">—</span>{" "}
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            schedule a meeting
          </Link>
        </p>
        <button
          onClick={handleClose}
          aria-label="Dismiss announcement"
          className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
