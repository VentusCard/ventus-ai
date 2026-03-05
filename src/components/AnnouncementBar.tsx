import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const AnnouncementBar = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="bg-blue-600 text-white text-center text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2 relative animate-slideDown">
    <span className="hidden sm:inline">🎉</span>
    <span>
      Ventus AI is demoing at <strong>Finovate Spring</strong> — May 5–7, San Diego
    </span>
    <Link
      to="/contact"
      className="underline underline-offset-2 font-semibold hover:text-white/90 whitespace-nowrap"
    >
      Schedule a Meeting →
    </Link>
    <button
      onClick={onDismiss}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1"
      aria-label="Dismiss"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default AnnouncementBar;
