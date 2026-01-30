import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            About Ventus
          </h1>
          
          <div className="space-y-8 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed">
                Ventus is dedicated to transforming financial services through intelligent automation 
                and AI-powered insights. We help financial advisors and institutions make better 
                decisions faster, with deeper understanding of client needs.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What We Do</h2>
              <p className="text-lg leading-relaxed">
                Our TePilot platform provides comprehensive transaction enrichment, lifestyle signal 
                detection, and advisor console capabilities. We turn raw financial data into 
                actionable intelligence that drives meaningful client conversations.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Team</h2>
              <p className="text-lg leading-relaxed">
                We're a team of fintech veterans, data scientists, and product designers 
                passionate about modernizing financial advisory services. Our diverse backgrounds 
                span banking, AI research, and enterprise software development.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
