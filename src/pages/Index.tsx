
import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import Rewards from "@/components/Rewards"
import Testimonials from "@/components/Testimonials"
import CTA from "@/components/CTA"

const Index = () => {
  const [visibleSections, setVisibleSections] = useState({
    rewards: false,
    testimonials: false,
    cta: false
  });
  
  const rewardsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.8; // Trigger slightly earlier
      
      // Check each section visibility
      if (rewardsRef.current && scrollPosition > rewardsRef.current.offsetTop) {
        setVisibleSections(prev => ({ ...prev, rewards: true }));
      }
      
      if (testimonialsRef.current && scrollPosition > testimonialsRef.current.offsetTop) {
        setVisibleSections(prev => ({ ...prev, testimonials: true }));
      }
      
      if (ctaRef.current && scrollPosition > ctaRef.current.offsetTop) {
        setVisibleSections(prev => ({ ...prev, cta: true }));
      }
    };
    
    // Call once to check initial visibility
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
