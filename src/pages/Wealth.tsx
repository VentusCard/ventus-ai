import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechnologyBackground from "@/components/technology/TechnologyBackground";
import VentusWealthDemo from "@/components/technology/demos/VentusWealthDemo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Briefcase, 
  ArrowLeft, 
  Calendar, 
  UserCheck, 
  ClipboardCheck, 
  Bell,
  Home,
  GraduationCap,
  Heart,
  TrendingUp
} from "lucide-react";


const Wealth = () => {
  const features = [
    {
      icon: Calendar,
      title: "Lifestyle Event Detection",
      description: "Automatically identify major life events—home purchases, new children, job changes—from transaction patterns before clients mention them."
    },
    {
      icon: Bell,
      title: "Proactive Engagement Triggers",
      description: "Receive intelligent alerts when client behavior suggests an opportunity for outreach or a need for advisory attention."
    },
    {
      icon: ClipboardCheck,
      title: "Administrative Automation",
      description: "Reduce manual tasks with automated client data updates, meeting prep summaries, and compliance documentation."
    },
    {
      icon: UserCheck,
      title: "Client Intelligence Dashboard",
      description: "Access a unified view of client financial behaviors, goals, and life events to power more meaningful conversations."
    }
  ];

  const useCases = [
    {
      icon: Home,
      title: "Home Purchase Planning",
      description: "Detect saving patterns indicating home buying intent and proactively offer mortgage and investment rebalancing advice."
    },
    {
      icon: GraduationCap,
      title: "Education Funding",
      description: "Identify families with education expenses approaching and recommend 529 plans or other education savings strategies."
    },
    {
      icon: Heart,
      title: "Life Milestone Support",
      description: "Recognize marriage, divorce, or family changes from spending patterns and offer appropriate financial guidance."
    },
    {
      icon: TrendingUp,
      title: "Investment Optimization",
      description: "Spot changes in client risk tolerance or cash flow to recommend portfolio adjustments at the right time."
    }
  ];

  const benefits = [
    "50% reduction in meeting prep time",
    "Earlier identification of client needs",
    "Improved client retention rates",
    "More meaningful client conversations"
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <TechnologyBackground />
      <Navbar />
      <main className="pt-20 pb-10 relative z-10">
        {/* Hero Section */}
        <section className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <Link 
              to="/technology" 
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors animate-fade-float"
              style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to What We Do
            </Link>
            
            <div 
              className="flex items-center gap-4 mb-6 animate-fade-float"
              style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Wealth Management CoPilot
              </h1>
              
            </div>
            
            <p 
              className="text-xl text-foreground/70 max-w-3xl animate-fade-float"
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              Surface lifestyle events and behavioral insights that automate administrative 
              tasks and create opportunities for proactive, meaningful client engagement.
            </p>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div 
              className="p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 animate-fade-float"
              style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
              <p className="text-foreground/70 leading-relaxed text-lg">
                Wealth advisors spend too much time on administrative tasks and too little on 
                what matters most: building relationships and delivering advice. Ventus CoPilot 
                analyzes transaction data to surface life events, behavioral changes, and 
                opportunities that advisors would otherwise miss. By automating routine tasks 
                and providing intelligent alerts, we help advisors spend more time on high-value 
                client interactions—strengthening relationships and growing assets under management.
              </p>
            </div>
          </div>
        </section>

        {/* See It In Action */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2
              className="text-2xl font-semibold text-foreground mb-8 animate-fade-float"
              style={{ animationDelay: '0.45s', animationFillMode: 'backwards' }}
            >
              See It In Action
            </h2>
            <div
              className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden animate-fade-float"
              style={{ animationDelay: '0.55s', animationFillMode: 'backwards' }}
            >
              <VentusWealthDemo />
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 
              className="text-2xl font-semibold text-foreground mb-8 animate-fade-float"
              style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
            >
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm 
                    hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] 
                    hover:scale-[1.02] transition-all duration-500 ease-out animate-fade-float"
                  style={{ animationDelay: `${0.5 + (index + 1) * 0.1}s`, animationFillMode: 'backwards' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 
                    transition-all duration-500 group-hover:bg-primary/20 
                    group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                    <feature.icon className="w-6 h-6 text-primary transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 
              className="text-2xl font-semibold text-foreground mb-8 animate-fade-float"
              style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}
            >
              Use Cases
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm 
                    hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] 
                    hover:scale-[1.02] transition-all duration-500 ease-out animate-fade-float"
                  style={{ animationDelay: `${0.9 + (index + 1) * 0.1}s`, animationFillMode: 'backwards' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 
                    transition-all duration-500 group-hover:bg-primary/20 
                    group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                    <useCase.icon className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">
                    {useCase.title}
                  </h3>
                  <p className="text-foreground/70">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div 
              className="p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 animate-fade-float"
              style={{ animationDelay: '1.3s', animationFillMode: 'backwards' }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">Benefits</h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground/80">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div 
            className="max-w-7xl mx-auto px-4 md:px-8 text-center animate-fade-float"
            style={{ animationDelay: '1.4s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Empower Your Advisors?
            </h2>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Discover how Wealth CoPilot can free up advisor time and deepen client relationships.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                  Schedule a Demo
                </Button>
              </Link>
              <Link to="/technology">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10">
                  Explore All Capabilities
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Wealth;
