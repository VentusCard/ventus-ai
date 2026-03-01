

import VentusSmartRewards from "@/components/technology/demos/VentusSmartRewards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Gift, ArrowLeft, UserCheck, Sparkles, Target, RefreshCw, TrendingUp, Heart, Percent, Bell } from "lucide-react";

const SmartRewards = () => {
  const features = [
    { icon: UserCheck, title: "AI-Driven Purchase Personas", description: "Build dynamic customer profiles based on spending patterns, preferences, and lifestyle signals extracted from transaction data." },
    { icon: Target, title: "Dynamic Offer Matching", description: "Match customers to the most relevant rewards and offers in real-time based on their unique behavioral patterns and preferences." },
    { icon: Sparkles, title: "Personalized Recommendations", description: "Deliver reward suggestions that feel intuitive and valuable, not random—driving higher engagement and satisfaction." },
    { icon: RefreshCw, title: "Continuous Learning", description: "Algorithms that evolve with each transaction, refining recommendations as customer preferences and behaviors change." }
  ];

  const useCases = [
    { icon: TrendingUp, title: "Increased Redemption Rates", description: "Boost reward redemption by 3-5x by presenting offers customers actually want at the moment they're most receptive." },
    { icon: Percent, title: "Targeted Promotions", description: "Run merchant partner campaigns that reach the right customers, maximizing ROI for both the bank and partners." },
    { icon: Heart, title: "Loyalty Enhancement", description: "Strengthen customer relationships by demonstrating that you understand and value their unique preferences." },
    { icon: Bell, title: "Proactive Notifications", description: "Alert customers to relevant deals and rewards before they even search, creating moments of delight." }
  ];

  const benefits = [
    "3-5x increase in reward redemption rates",
    "Higher customer satisfaction scores",
    "Improved merchant partner ROI",
    "Reduced reward program costs through targeting"
  ];

  return (
    <div>
      <main className="pt-20 pb-10">
        <section className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">


            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Intelligent Reward Personalization</h1>
            </div>
            <p className="text-xl text-gray-500 max-w-3xl">
              Deliver rewards, offers, and content that resonate with each customer's unique lifestyle and spending habits using AI-driven purchase personas.
            </p>
          </div>
        </section>

        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-500">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-500 leading-relaxed text-lg">
                Traditional rewards programs treat all customers the same, resulting in low engagement and wasted marketing spend. Ventus SmartRewards uses AI to understand each customer's unique preferences and behaviors, enabling hyper-personalized reward recommendations that feel intuitive rather than intrusive.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">See It In Action</h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <VentusSmartRewards />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="group p-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-500 ease-out">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 transition-all duration-500 group-hover:bg-blue-100">
                    <feature.icon className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-blue-600">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="group p-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-500 ease-out">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 transition-all duration-500 group-hover:bg-blue-100">
                    <useCase.icon className="w-5 h-5 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-blue-600">{useCase.title}</h3>
                  <p className="text-gray-500">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-500">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Benefits</h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Supercharge Your Rewards Program?</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">Learn how SmartRewards can increase engagement and deliver personalized value to every customer.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
              </Link>
              <Link to="/technology">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Explore All Capabilities</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SmartRewards;
