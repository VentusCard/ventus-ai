import { Target, ShoppingBag, Users, Calendar, Heart, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
const tools = [{
  icon: Target,
  title: "Goal-Based Targeting",
  description: "Match your deals to customers pursuing specific lifestyle goals.",
  examples: [
    "2x points for fitness enthusiasts on gym gear",
    "Bonus rewards for eco-conscious users on sustainable products", 
    "Extra cashback for students on educational purchases"
  ],
  gradient: "from-purple-500 via-pink-500 to-red-500",
  accentColor: "#f472b6"
}, {
  icon: ShoppingBag,
  title: "Purchase-Focused Tools",
  description: "Target customers based on spending behaviors and thresholds.",
  examples: [
    "15% cashback on sports gear purchases over $300",
    "Double rewards for team sports: Buy 5+ items, get 20% off",
    "Tiered sports rewards: 5% at $150, 10% at $400, 15% at $750+"
  ],
  gradient: "from-blue-500 via-cyan-500 to-teal-500",
  accentColor: "#22d3ee"
}, {
  icon: Users,
  title: "Behavioral Clustering",
  description: "Reach superfans across related product categories automatically.",
  examples: [
    "Basketball superfans: Game tickets + sports gear",
    "Coffee connoisseurs: Premium beans + brewing equipment",
    "Travel enthusiasts: Flights + accommodation + gear"
  ],
  gradient: "from-rose-500 via-red-500 to-orange-500",
  accentColor: "#fb7185"
}, {
  icon: Calendar,
  title: "Seasonal Timing Intelligence",
  description: "Launch promotions when customers are primed to buy.",
  examples: [
    "Ski gear promotions for mountain residents in October",
    "Beach wear deals for warm climate users in March",
    "Holiday shopping alerts 3 weeks before peak season"
  ],
  gradient: "from-orange-500 via-amber-500 to-yellow-500",
  accentColor: "#fbbf24"
}, {
  icon: Heart,
  title: "Retention & Loyalty Tools",
  description: "Re-engage past customers with personalized offers.",
  examples: [
    "Return customer: 20% off + free shipping",
    "Loyalty streak: Free item after 5 purchases",
    "VIP early access to sales and new products"
  ],
  gradient: "from-pink-500 via-rose-500 to-red-500",
  accentColor: "#f472b6"
}, {
  icon: Brain,
  title: "Continuous AI Optimization",
  description: "Real-time campaign refinement based on performance data.",
  examples: [
    "Real-time personalization based on browsing patterns",
    "Dynamic pricing optimization for maximum conversion",
    "Predictive recommendations before users search"
  ],
  gradient: "from-cyan-500 via-teal-500 to-emerald-500",
  accentColor: "#2dd4bf"
}];
const PartnerToolsSection = () => {
  const [currentExamples, setCurrentExamples] = useState<{ [key: number]: number }>({});
  const [isHovered, setIsHovered] = useState<{ [key: number]: boolean }>({});
  const [animatingCards, setAnimatingCards] = useState<{ [key: number]: boolean }>({});
  const [touchStart, setTouchStart] = useState<{ [key: number]: number | null }>({});
  const [touchEnd, setTouchEnd] = useState<{ [key: number]: number | null }>({});

  useEffect(() => {
    const intervals: { [key: number]: NodeJS.Timeout } = {};

    tools.forEach((tool, index) => {
      if (tool.examples) {
        intervals[index] = setInterval(() => {
          if (!isHovered[index]) {
            smoothTransition(index, ((currentExamples[index] || 0) + 1) % tool.examples.length);
          }
        }, 4000);
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [isHovered, currentExamples]);

  const smoothTransition = (cardIndex: number, nextExampleIndex: number) => {
    setAnimatingCards(prev => ({ ...prev, [cardIndex]: true }));
    
    setTimeout(() => {
      setCurrentExamples(prev => ({
        ...prev,
        [cardIndex]: nextExampleIndex
      }));
      
      setTimeout(() => {
        setAnimatingCards(prev => ({ ...prev, [cardIndex]: false }));
      }, 150);
    }, 150);
  };

  const handleDotClick = (cardIndex: number, exampleIndex: number) => {
    if (!animatingCards[cardIndex]) {
      smoothTransition(cardIndex, exampleIndex);
    }
  };

  const handleMouseEnter = (index: number) => {
    setIsHovered(prev => ({ ...prev, [index]: true }));
  };

  const handleMouseLeave = (index: number) => {
    setIsHovered(prev => ({ ...prev, [index]: false }));
  };

  // Touch/swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent, cardIndex: number) => {
    setTouchEnd(prev => ({ ...prev, [cardIndex]: null }));
    setTouchStart(prev => ({ ...prev, [cardIndex]: e.targetTouches[0].clientX }));
  };

  const onTouchMove = (e: React.TouchEvent, cardIndex: number) => {
    setTouchEnd(prev => ({ ...prev, [cardIndex]: e.targetTouches[0].clientX }));
  };

  const onTouchEnd = (cardIndex: number, totalExamples: number) => {
    const start = touchStart[cardIndex];
    const end = touchEnd[cardIndex];
    
    if (!start || !end) return;
    
    const distance = start - end;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      const nextIndex = ((currentExamples[cardIndex] || 0) + 1) % totalExamples;
      smoothTransition(cardIndex, nextIndex);
    }
    if (isRightSwipe) {
      const prevIndex = ((currentExamples[cardIndex] || 0) - 1 + totalExamples) % totalExamples;
      smoothTransition(cardIndex, prevIndex);
    }
  };

  return <section className="py-16 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto">
      
      <div className="relative">
        <div className="text-center mb-12 mt-0">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Suite of <span className="italic font-light text-muted-foreground">Advanced Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ventus leverages proprietary AI and analytics to create a customizable tool suite 
            to drive engagement and maximize revenue. Cutting-edge capabilities, zero integration.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon;
            const currentExample = tool.examples ? tool.examples[currentExamples[index] || 0] : null;
            
            return <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-500 border-border bg-card hover:scale-[1.02] animate-fade-in overflow-hidden relative"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              onTouchStart={(e) => onTouchStart(e, index)}
              onTouchMove={(e) => onTouchMove(e, index)}
              onTouchEnd={() => onTouchEnd(index, tool.examples.length)}
            >
                {/* Bottom gradient border */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient}`}></div>
                
                <CardHeader className="relative pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <CardDescription className={`text-base leading-relaxed text-muted-foreground transition-all duration-300 ${animatingCards[index] ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                    {tool.description}
                  </CardDescription>
                  
                  {/* Example text */}
                  {tool.examples && (
                    <p 
                      className={`mt-4 text-sm italic transition-all duration-300 ${animatingCards[index] ? 'opacity-0' : 'opacity-100'}`} 
                      style={{ color: tool.accentColor }}
                    >
                      "{currentExample}"
                    </p>
                  )}
                  
                  {/* Example indicators */}
                  {tool.examples && (
                    <div className="flex items-center space-x-1.5 mt-3">
                      {tool.examples.map((_, exampleIndex) => (
                        <button
                          key={exampleIndex}
                          onClick={() => handleDotClick(index, exampleIndex)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer ${
                            (currentExamples[index] || 0) === exampleIndex
                              ? `bg-gradient-to-r ${tool.gradient}` 
                              : 'bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>;
          })}
        </div>
      </div>
      </div>
    </section>;
};
export default PartnerToolsSection;