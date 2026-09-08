import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignalToActionPanel from "@/components/home/SignalToActionPanel";

const ScrollHero = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-28 md:pb-28 md:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[radial-gradient(60%_60%_at_75%_35%,rgba(37,99,235,0.14),transparent_70%),radial-gradient(45%_55%_at_92%_75%,rgba(139,92,246,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:px-8 lg:grid-cols-[45fr_55fr]">
        <div className="ventus-hero-rise">
          <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
            Customer intelligence for banks
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-[52px]">
            Everything you need to know about your customer is already in their account.
          </h1>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full bg-blue-600 px-7 text-base font-semibold text-white hover:bg-blue-700"
              onClick={() => navigate("/contact")}
            >
              Schedule Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-slate-300 px-7 text-base font-semibold text-slate-700"
              onClick={() => scrollTo("one-customer")}
            >
              See the platform
            </Button>
          </div>
        </div>

        <div className="ventus-hero-rise relative" style={{ animationDelay: "120ms" }}>
          <SignalToActionPanel />
        </div>
      </div>
    </section>
  );
};

export default ScrollHero;
