import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Brain, Target, TrendingUp, Zap, Shield, ArrowRight, Sparkles, ChevronDown } from "lucide-react";

const VentusAI = () => {
  // Auto-scroll disabled per user request
  const scrollToChat = () => {
    // Scroll functionality disabled
  };

  const features = [{
    icon: Brain,
    title: "Intelligent Analysis",
    description: "AI analyzes your spending patterns and lifestyle preferences to identify the best reward opportunities"
  }, {
    icon: Target,
    title: "Personalized Recommendations",
    description: "Get tailored suggestions for maximizing rewards based on your unique spending habits"
  }, {
    icon: TrendingUp,
    title: "Real-time Optimization",
    description: "Continuous learning and adaptation to ensure you're always earning maximum rewards"
  }, {
    icon: Zap,
    title: "Instant Insights",
    description: "Quick answers to your reward questions and immediate optimization suggestions"
  }, {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is protected with enterprise-grade security and privacy measures"
  }, {
    icon: Sparkles,
    title: "AI Shopping",
    description: "Secures eligible deals and completes wishlist items purchases with your permission"
  }];

  const steps = [{
    step: "1",
    title: "Connect Your Data",
    description: "Securely link your financial accounts to give Ventus AI insight into your spending patterns"
  }, {
    step: "2",
    title: "AI Analysis",
    description: "Our AI analyzes your transactions, categories, and preferences to understand your lifestyle"
  }, {
    step: "3",
    title: "Personalized Strategy",
    description: "Receive a customized reward optimization strategy tailored specifically to your spending habits"
  }, {
    step: "4",
    title: "Continuous Optimization",
    description: "Ventus AI continuously learns and adapts, ensuring you're always maximizing your rewards"
  }];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <div className="text-center max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-foreground">Ventus AI:</span>{" "}
            <span className="italic font-light text-muted-foreground">Your Intelligent</span>
            <br />
            <span className="italic font-light text-muted-foreground">Rewards Partner</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Harness the power of AI to maximize your rewards and unlock personalized deals with zero complexity.
          </p>
          <Link to="/app">
            <Button size="lg" className="px-10 py-6 text-lg rounded-full">
              Get Started
            </Button>
          </Link>
          
          {/* Scroll indicator */}
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="mt-8 animate-fade-in"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
          </button>
        </div>
        
        {/* Subtle bottom line separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
      </section>

      {/* What Ventus AI Does Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Suite of Advanced AI Tools</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful capabilities that put the right deals in front of you at the right time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-[#0064E0]/10 border-[#0064E0]/20 hover:border-[#0064E0]/40 transition-all duration-300">
              <div className="w-12 h-12 bg-[#0064E0]/20 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-[#0064E0]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      

      {/* Chatbot Section */}
      


      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <Card className="max-w-4xl mx-auto p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Maximize Your Rewards?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already earning more with intelligent reward optimization.
          </p>
          <Link to="/app">
            <Button size="lg" className="px-10 py-6 text-lg rounded-full">
              Try Ventus AI
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>
      
      <Footer />
    </div>
  );
};

export default VentusAI;
