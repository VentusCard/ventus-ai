

import AnimatedDemo from "@/components/technology/AnimatedDemo";
import { engagementDemoHtml } from "@/components/technology/demos/engagement-demo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, ArrowLeft, Layers, Plug, BookOpen, MessageSquare, UserPlus, ArrowUpRight, Award, Smartphone } from "lucide-react";

const Engagement = () => {
  const features = [
    { icon: Layers, title: "Unified Experience Platform", description: "Combine rewards, perks, educational content, and personalized insights into a single cohesive customer experience." },
    { icon: Plug, title: "Seamless Integration", description: "Connect with your existing banking platforms and channels without disrupting current workflows or customer journeys." },
    { icon: BookOpen, title: "Personalized Education", description: "Deliver financial literacy content tailored to each customer's situation, goals, and current life stage." },
    { icon: MessageSquare, title: "Contextual Communication", description: "Send the right message at the right time through the right channel, based on customer preferences and behavior." }
  ];

  const useCases = [
    { icon: UserPlus, title: "Improved Retention", description: "Keep customers engaged with a steady stream of relevant, valuable content and offers that demonstrate your understanding." },
    { icon: ArrowUpRight, title: "Cross-Sell Opportunities", description: "Identify and act on natural moments to introduce additional products that genuinely fit customer needs." },
    { icon: Award, title: "Loyalty Programs", description: "Create tiered engagement programs that reward active customers while nurturing less engaged ones." },
    { icon: Smartphone, title: "Mobile-First Engagement", description: "Deliver seamless experiences across mobile banking apps, web portals, and other digital touchpoints." }
  ];

  const benefits = [
    "25% improvement in customer retention",
    "Unified view across all touchpoints",
    "Higher product adoption rates",
    "Reduced customer acquisition costs"
  ];

  return (
    <div>
      <main className="pt-20 pb-10">
        <section className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <Link to="/technology" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to What We Do
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Holistic Customer Engagement</h1>
            </div>
            <p className="text-xl text-gray-500 max-w-3xl">
              Enable a unified experience—combining rewards, perks, and educational content—that feels seamless and personalized, not like a patchwork of products.
            </p>
          </div>
        </section>

        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-500">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-500 leading-relaxed text-lg">
                Today's customers expect seamless, personalized experiences across every interaction. Ventus Engagement brings together rewards, perks, educational content, and personalized insights into a unified platform that adapts to each customer's journey.
              </p>
            </div>
          </div>
        </section>

        <AnimatedDemo htmlContent={engagementDemoHtml} animationDelay="0.45s" />

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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Unify Your Customer Experience?</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">See how holistic engagement can transform customer relationships and drive long-term loyalty.</p>
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

export default Engagement;
