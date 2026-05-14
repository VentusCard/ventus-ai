import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl bg-white p-0 overflow-hidden rounded-2xl border-none shadow-2xl [&>button]:opacity-30 [&>button]:hover:opacity-60 [&>button]:border-0 [&>button]:bg-transparent [&>button]:shadow-none [&>button]:ring-0"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <div className="px-12 py-16 flex flex-col">
          {/* Header */}
          <div className="flex flex-col items-center mb-16 pb-5 border-b border-slate-200">
            <img src={ventusLogo} alt="Ventus AI" className="w-48 object-contain" />
            <Link
              to="/bank-analytics"
              onClick={() => onOpenChange(false)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
            >
              Bank Analytics Dashboard <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          {/* Middle - side-by-side comparison */}
          <div className="w-full flex items-center justify-between gap-6 mb-20">
            <div className="flex-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Banking Today</p>
              <p className="text-lg font-normal text-slate-800">Generic. Static. The same for everyone.</p>
            </div>
            <ArrowRight className="w-8 h-8 text-blue-600 shrink-0" strokeWidth={1.5} />
            <div className="flex-1 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-blue-600 mb-3 font-extrabold">With Ventus AI</p>
              <p className="text-lg font-normal text-slate-800">
                Personalized. Intelligent. Individualized for each customer.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="text-center">
            <p className="text-2xl font-medium text-blue-600 mb-3">
              The future of banking is smarter <em className="italic">and</em> warmer
            </p>
            <p className="text-lg font-light text-primary-foreground">www.ventusai.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
