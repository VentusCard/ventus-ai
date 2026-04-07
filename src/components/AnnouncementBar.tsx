import { Link } from "react-router-dom";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const AnnouncementBar = ({ onDismiss }: {onDismiss: () => void;}) =>
<div className="bg-blue-600 text-white text-center text-xs sm:text-sm py-2 px-2 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 animate-slideDown">
    <span className="hidden sm:inline">🎉</span>
    <span className="hidden sm:inline">
      Ventus AI in the demoing lineup at <strong>Finovate Spring —</strong> May 5–7
    </span>
    <span className="sm:hidden">
      <Link to="/contact" className="underline underline-offset-2 font-semibold hover:text-white/90">
        Meet us at Finovate · May 5–7 →
      </Link>
    </span>
    <Link
      to="/contact"
      className="hidden sm:inline underline underline-offset-2 font-semibold hover:text-white/90 whitespace-nowrap text-sm">
      Schedule a Meeting →
    </Link>
    <button onClick={onDismiss}
  className="text-white/70 hover:text-white p-1 shrink-0 ml-1"
  aria-label="Dismiss">
    
      <X className="h-3.5 w-3.5" />
    </button>
  </div>;


export default AnnouncementBar;