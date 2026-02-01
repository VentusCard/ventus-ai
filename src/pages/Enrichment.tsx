import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Brain, 
  ArrowLeft, 
  MapPin, 
  TrendingUp, 
  Tag, 
  Zap,
  Shield,
  BarChart3,
  FileText,
  Building
} from "lucide-react";

const Enrichment = () => {
  const features = [
    {
      icon: Tag,
      title: "Smart Category Detection",
      description: "Automatically classify transactions into granular categories using contextual AI that understands merchant names, MCC codes, and transaction patterns."
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Extract geographic insights from transactions to understand customer travel patterns, local vs. distant spending, and regional preferences."
    },
    {
      icon: TrendingUp,
      title: "Spending Velocity Analysis",
      description: "Track spending momentum and detect unusual patterns in real-time, enabling proactive engagement and fraud prevention."
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Enrich transactions as they occur with sub-second latency, enabling immediate personalization and alert capabilities."
    }
  ];

  const useCases = [
    {
      icon: Shield,
      title: "Fraud Detection",
      description: "Identify anomalous transactions by comparing enriched data against established customer behavior patterns."
    },
    {
      icon: BarChart3,
      title: "Personalized Insights",
      description: "Deliver spending summaries and financial health insights tailored to each customer's unique transaction history."
    },
    {
      icon: FileText,
      title: "Enhanced Statements",
      description: "Transform cryptic merchant codes into clear, readable transaction descriptions customers actually understand."
    },
    {
      icon: Building,
      title: "Regulatory Compliance",
      description: "Maintain detailed transaction metadata for AML monitoring and regulatory reporting requirements."
    }
  ];

  const benefits = [
    "95%+ accuracy in merchant identification",
    "40% reduction in customer service inquiries",
    "Real-time enrichment under 100ms",
    "Seamless API integration with existing systems"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <Link 
              to="/technology" 
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to What We Do
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Advanced Transaction Enrichment
              </h1>
            </div>
            
            <p className="text-xl text-foreground/70 max-w-3xl">
              Transform raw transaction data into actionable intelligence with semantic AI 
              that goes far beyond basic merchant name cleaning.
            </p>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
              <p className="text-foreground/70 leading-relaxed text-lg">
                Our semantic AI analyzes every transaction to extract deep, contextual signals—merchant 
                category, location patterns, spending velocity, and more. Unlike traditional enrichment 
                that simply cleans merchant names, Ventus builds a complete picture of customer behavior 
                by understanding the context and meaning behind each transaction. This enables financial 
                institutions to deliver truly personalized experiences while maintaining the highest 
                standards of data accuracy.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-semibold text-foreground mb-8">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
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
            <h2 className="text-2xl font-semibold text-foreground mb-8">Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <useCase.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
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
            <div className="p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
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
          <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Transform Your Transaction Data?
            </h2>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Discover how Ventus enrichment can unlock new insights and opportunities for your institution.
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

export default Enrichment;
