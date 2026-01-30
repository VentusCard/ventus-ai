import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CTA from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
