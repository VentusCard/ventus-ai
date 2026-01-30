import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Handshake, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            About Ventus AI
          </h1>
          
          <div className="space-y-12 text-foreground/80">
            {/* What is Ventus AI */}
            <section className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">What is Ventus AI?</h2>
                  <p className="text-lg leading-relaxed">
                    Ventus AI is a transaction intelligence platform designed for financial institutions. 
                    We go beyond basic enrichment, using advanced AI to interpret transaction data and 
                    reveal consumer intent, behavior, and life events. This helps banks, credit unions, 
                    and wealth managers create more personalized, proactive customer experiences.
                  </p>
                </div>
              </div>
            </section>
            
            {/* Our Approach */}
            <section className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Bank-First Collaboration</h2>
                  <p className="text-lg leading-relaxed">
                    We work directly with financial institutions as technology partners, not competitors. 
                    Ventus AI integrates seamlessly into existing banking infrastructure, enhancing 
                    customer engagement without disrupting established workflows. Our platform is designed 
                    to complement your existing systems and amplify your institution's ability to 
                    understand and serve customers.
                  </p>
                </div>
              </div>
            </section>
            
            {/* How We Work */}
            <section className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Handshake className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How We Work</h2>
                  <p className="text-lg leading-relaxed mb-4">
                    Ventus AI offers flexible integration options to meet your institution where you are:
                  </p>
                  <ul className="space-y-3 text-lg">
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-semibold">API Integration:</span>
                      <span>Connect our intelligence directly to your existing applications and workflows.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-semibold">In-App Experience:</span>
                      <span>Deploy our consumer-facing features within your mobile or web banking platforms.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
