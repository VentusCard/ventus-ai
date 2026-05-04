import { Dialog, DialogContent } from "@/components/ui/dialog";
import ventusLogo from "@/assets/ventus-logo-blue.png";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-5xl bg-white p-0 overflow-hidden rounded-2xl [&>button]:opacity-30 [&>button]:hover:opacity-60 [&>button]:border-0 [&>button]:bg-transparent [&>button]:shadow-none [&>button]:ring-0"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {/* Full-width header */}
        <div className="flex items-center gap-4 px-12 pt-10 pb-8 border-b border-slate-200">
          <img src={ventusLogo} alt="Ventus AI" className="w-44" />
          <div className="h-8 w-px bg-slate-300" />
          <p className="text-slate-800 text-2xl font-extrabold">Future of banking should be both smart and personal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {/* Left panel — Mission */}
          <div className="bg-slate-50 p-10 md:p-14 flex flex-col items-center justify-start text-center border-b md:border-b-0 md:border-r border-slate-200 pt-10">
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-700 mb-10 -mt-2">Mission</h3>

            <div className="space-y-10 flex flex-col justify-center">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">Banking Today</p>
                <p className="text-base text-slate-500 leading-relaxed">Generic. Static. The same for everyone.</p>
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600 mb-2">With Ventus AI</p>
                <p className="text-base text-slate-700 leading-relaxed font-medium">Personalized. Intelligent. Built for each customer.</p>
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-900 mb-2">What's Next</p>
                <p className="text-base font-semibold leading-relaxed bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Autonomous with warmth — banks that know their customers, serve them better.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel — Come find us */}
          <div className="p-10 md:p-14 flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-medium text-blue-600 mb-3">
              Come find us in the networking hall.
            </p>
            <p className="text-xs text-slate-400">ventusai.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
