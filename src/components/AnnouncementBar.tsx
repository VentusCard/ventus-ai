import { Link } from "react-router-dom";
import { X } from "lucide-react";

const AnnouncementBar = ({ onDismiss }: {onDismiss: () => void;}) =>
<div className="bg-blue-600 text-white text-center text-xs sm:text-sm py-1.5 px-8 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 animate-slideDown relative">
    <span className="hidden sm:inline">🎉</span>
    <span className="hidden sm:inline">
      Ventus AI in the demoing lineup at <strong>Finovate Spring —</strong> May 5–7
    </span>
    <span className="sm:hidden">
      <Link to="/contact" className="underline underline-offset-2 font-semibold hover:text-white/90 text-sm">
        Meet us at Finovate · May 5–7 →
      </Link>
    </span>
    <Link
      to="/contact"
      className="hidden sm:inline underline underline-offset-2 font-semibold hover:text-white/90 whitespace-nowrap text-sm">
      Schedule a Meeting →
    </Link>
    <button onClick={onDismiss}
      className="absolute right-2 text-white/70 hover:text-white p-1 shrink-0"
      aria-label="Dismiss">
        <X className="h-3 w-3" />
    </button>
  </div>;


export default AnnouncementBar;