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
        className="sm:max-w-2xl bg-white p-0 overflow-hidden rounded-2xl border-none shadow-2xl [&>button]:opacity-30 [&>button]:hover:opacity-60 [&>button]:border-0 [&>button]:bg-transparent [&>button]:shadow-none [&>button]:ring-0"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <div className="px-12 py-16 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-5 mb-16">
            <img src={ventusLogo} alt="Ventus AI" className="w-36 shrink-0" />
            <p className="text-xl font-semibold text-slate-800 leading-snug">
              Future of banking should be both smart and personal
            </p>
          </div>

          {/* Middle */}
          <div className="w-full space-y-12 mb-20 text-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Banking Today
              </p>
              <p className="text-lg font-normal text-slate-800">
                Generic. Static. The same for everyone.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2">
                With Ventus AI
              </p>
              <p className="text-lg font-normal text-slate-800">
                Personalized. Intelligent. Built for each customer.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 mb-2">
                What's Next
              </p>
              <p className="text-lg font-medium text-blue-600">
                Autonomous with warmth — banks that know their customers, serve them better.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="text-center">
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
