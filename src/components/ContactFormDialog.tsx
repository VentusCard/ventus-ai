import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  const [page, setPage] = useState<1 | 2>(1);

  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl bg-white p-0 overflow-hidden rounded-2xl border-none shadow-2xl [&>button]:top-4 [&>button]:right-4 [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-full [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-slate-100 [&>button]:hover:bg-slate-200 [&>button]:text-slate-700 [&>button]:opacity-100 [&>button]:border-0 [&>button]:shadow-none [&>button]:ring-0 [&>button>svg]:h-4 [&>button>svg]:w-4"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <div className="px-12 pt-16 pb-8 flex flex-col min-h-[520px]">
          {/* Header */}
          <div className="flex flex-col items-center mb-12 pb-5 border-b border-slate-200">
            <img src={ventusLogo} alt="Ventus AI" className="w-48 object-contain" />
          </div>

          {/* Page content */}
          <div className="flex-1 flex flex-col justify-center">
            {page === 1 ? (
              <div className="text-center mx-auto">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                  Next Steps
                </p>
                <h2 className="text-3xl font-medium text-slate-900 mb-4">AI-Powered Customer Intelligence</h2>
                <p className="text-lg font-light text-slate-600 mb-10 leading-relaxed whitespace-nowrap">
                  Manage everything you've seen so far, and unlock new analytical capabilities.
                </p>
                <a
                  href="/bank-analytics?from=demo"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors"
                >
                  AI-Powered Customer Intelligence Dashboard <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            ) : (
              <div>
                {/* Side-by-side comparison */}
                <div className="w-full flex items-center justify-between gap-6 mb-14">
                  <div className="flex-1 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                      Banking Today
                    </p>
                    <p className="text-lg font-normal text-slate-800">
                      Generic. Static. The same for everyone.
                    </p>
                  </div>
                  <ArrowRight className="w-8 h-8 text-blue-600 shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 text-center">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-blue-600 mb-3 font-extrabold">
                      With Ventus AI
                    </p>
                    <p className="text-lg font-normal text-slate-800">
                      Personalized. Intelligent. Individualized for each customer.
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <div className="text-center">
                  <p className="text-2xl font-medium text-blue-600 mb-3">
                    The future of banking is smarter <em className="italic">and</em> warmer
                  </p>
                  <p className="text-lg font-light text-primary-foreground">www.ventusai.com</p>
                </div>
              </div>
            )}
          </div>

          {/* Pager */}
          <div className="mt-10 flex items-center justify-between">
            <div className="w-24">
              {page === 2 && (
                <button
                  onClick={() => setPage(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  page === 1 ? "bg-slate-900" : "bg-slate-300"
                }`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  page === 2 ? "bg-slate-900" : "bg-slate-300"
                }`}
              />
            </div>
            <div className="w-24 text-right">
              {page === 1 && (
                <button
                  onClick={() => setPage(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
