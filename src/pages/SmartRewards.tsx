import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechnologyBackground from "@/components/technology/TechnologyBackground";
import AnimatedDemo from "@/components/technology/AnimatedDemo";
import { rewardsDemoHtml } from "@/components/technology/demos/rewards-demo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Gift, 
  ArrowLeft, 
  UserCheck, 
  Sparkles, 
  Target, 
  RefreshCw,
  TrendingUp,
  Heart,
  Percent,
  Bell
} from "lucide-react";

const SmartRewards = () => {
  const features = [
    {
      icon: UserCheck,
      title: "AI-Driven Purchase Personas",
      description: "Build dynamic customer profiles based on spending patterns, preferences, and lifestyle signals extracted from transaction data."
    },
    {
      icon: Target,
      title: "Dynamic Offer Matching",
      description: "Match customers to the most relevant rewards and offers in real-time based on their unique behavioral patterns and preferences."
    },
    {
      icon: Sparkles,
      title: "Personalized Recommendations",
      description: "Deliver reward suggestions that feel intuitive and valuable, not random—driving higher engagement and satisfaction."
    },
    {
      icon: RefreshCw,
      title: "Continuous Learning",
      description: "Algorithms that evolve with each transaction, refining recommendations as customer preferences and behaviors change."
    }
  ];

  const useCases = [
    {
      icon: TrendingUp,
      title: "Increased Redemption Rates",
      description: "Boost reward redemption by 3-5x by presenting offers customers actually want at the moment they're most receptive."
    },
    {
      icon: Percent,
      title: "Targeted Promotions",
      description: "Run merchant partner campaigns that reach the right customers, maximizing ROI for both the bank and partners."
    },
    {
      icon: Heart,
      title: "Loyalty Enhancement",
      description: "Strengthen customer relationships by demonstrating that you understand and value their unique preferences."
    },
    {
      icon: Bell,
      title: "Proactive Notifications",
      description: "Alert customers to relevant deals and rewards before they even search, creating moments of delight."
    }
  ];

  const benefits = [
    "3-5x increase in reward redemption rates",
    "Higher customer satisfaction scores",
    "Improved merchant partner ROI",
    "Reduced reward program costs through targeting"
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <TechnologyBackground />
      <Navbar />
      <main className="pt-20 pb-16 relative z-10">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
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
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Intelligent Reward Personalization
              </h1>
            </div>
            
            <p 
              className="text-xl text-foreground/70 max-w-3xl animate-fade-float"
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              Deliver rewards, offers, and content that resonate with each customer's 
              unique lifestyle and spending habits using AI-driven purchase personas.
            </p>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div 
              className="p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 animate-fade-float"
              style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
              <p className="text-foreground/70 leading-relaxed text-lg">
                Traditional rewards programs treat all customers the same, resulting in low engagement 
                and wasted marketing spend. Ventus SmartRewards uses AI to understand each customer's 
                unique preferences and behaviors, enabling hyper-personalized reward recommendations 
                that feel intuitive rather than intrusive. By matching customers to offers they 
                actually want, we help financial institutions maximize the value of their rewards 
                programs while building deeper customer loyalty.
              </p>
            </div>
          </div>
        </section>

        {/* See It In Action */}
        <AnimatedDemo htmlContent={rewardsDemoHtml} animationDelay="0.45s" />

        {/* Key Features Section */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
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
          <div className="max-w-6xl mx-auto px-4 md:px-8">
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
          <div className="max-w-6xl mx-auto px-4 md:px-8">
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
            className="max-w-6xl mx-auto px-4 md:px-8 text-center animate-fade-float"
            style={{ animationDelay: '1.4s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Supercharge Your Rewards Program?
            </h2>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Learn how SmartRewards can increase engagement and deliver personalized value to every customer.
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

export default SmartRewards;
