import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Users, Crosshair, Rocket } from "lucide-react";
import ventusLogo from "@/assets/ventus-logo-blue.png";
import goToMarketImg from "@/assets/deck/go-to-market.jpg";
import teamTractionImg from "@/assets/deck/team-traction.jpg";
import competitiveLandscapeImg from "@/assets/deck/competitive-landscape.jpg";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DECK_PAGES = [
  { label: "Team & Traction", icon: Users, image: teamTractionImg },
  { label: "Competitive Landscape", icon: Crosshair, image: competitiveLandscapeImg },
  { label: "Go-to-Market Strategy", icon: Rocket, image: goToMarketImg },
] as const;

export default function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  const [activeDeck, setActiveDeck] = useState<string | null>(null);

  const handleClose = () => {
    setActiveDeck(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !activeDeck} onOpenChange={(v) => { if (!v) { setActiveDeck(null); onOpenChange(false); } }}>
        <DialogContent className="sm:max-w-5xl bg-white p-0 overflow-hidden rounded-2xl">
          {/* Full-width header */}
          <div className="flex items-center gap-4 px-12 pt-10 pb-8 border-b border-slate-200">
            <img src={ventusLogo} alt="Ventus AI" className="w-44" />
            <div className="h-8 w-px bg-slate-300" />
            <p className="font-bold text-slate-800 text-2xl">Banking Should be Deeply Personal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
            {/* Left panel — Mission */}
            <div className="bg-slate-50 p-10 md:p-14 flex flex-col items-center justify-start text-center border-b md:border-b-0 md:border-r border-slate-200 pt-10">
              <h3 className="text-lg font-bold uppercase tracking-wider text-slate-700 mb-10 -mt-2">Mission</h3>

              <div className="space-y-10 flex flex-col justify-center">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">Right now</p>
                  <p className="text-base text-slate-500 leading-relaxed">Generic. Static. The same for everyone.</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600 mb-2">With VentusAI</p>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">Personalized. Intelligent. Built for each customer.</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-slate-900 mb-2">What's next</p>
                  <p className="text-base font-semibold leading-relaxed bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Autonomous with warmth: banks provide deeply personal experience with foresight.
                  </p>
                </div>
              </div>
            </div>

            {/* Right panel — Deck buttons */}
            <div className="p-10 md:p-14 flex flex-col items-center justify-start text-center pt-10">
              <h3 className="text-lg font-bold uppercase tracking-wider text-slate-700 mb-10 -mt-2">Learn More</h3>

              <div className="space-y-5 w-full max-w-sm">
                {DECK_PAGES.map((deck) => (
                  <button
                    key={deck.label}
                    onClick={() => setActiveDeck(deck.image)}
                    className="w-full flex items-center gap-4 px-6 py-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <deck.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-base font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {deck.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-screen deck viewer overlay */}
      {activeDeck && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-8"
          onClick={() => setActiveDeck(null)}
        >
          <button
            onClick={() => setActiveDeck(null)}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={activeDeck}
            alt="Deck slide"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
