import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Brain, Zap, Shield, BarChart3 } from "lucide-react";

const Technology = () => {
  const capabilities = [
    {
      icon: Brain,
      title: "AI-Powered Enrichment",
      description: "Advanced machine learning models classify and enrich transactions in real-time, extracting merchant details, spending categories, and lifestyle signals."
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Stream processing architecture handles millions of transactions per second with sub-second latency for instant insights."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, SOC 2 compliance, and zero-knowledge architecture ensure your data remains protected at all times."
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "Monte Carlo simulations, cash flow projections, and retirement planning tools powered by sophisticated financial modeling."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Technology
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Built on cutting-edge AI and cloud infrastructure to deliver 
              intelligent financial insights at scale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <capability.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {capability.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
          
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Platform Architecture
            </h2>
            <div className="p-8 rounded-2xl border border-border/50 bg-card">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-foreground/70">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">&lt;100ms</div>
                  <div className="text-foreground/70">API Response Time</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">50M+</div>
                  <div className="text-foreground/70">Transactions Processed Daily</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Technology;
