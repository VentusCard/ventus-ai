

import VentusWealthDemo from "@/components/technology/demos/VentusWealthDemo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, ArrowLeft, Calendar, UserCheck, ClipboardCheck, Bell, Home, GraduationCap, Heart, TrendingUp } from "lucide-react";

const Wealth = () => {
  const features = [
    { icon: Calendar, title: "Lifestyle Event Detection", description: "Automatically identify major life events—home purchases, new children, job changes—from transaction patterns before clients mention them." },
    { icon: Bell, title: "Proactive Engagement Triggers", description: "Receive intelligent alerts when client behavior suggests an opportunity for outreach or a need for advisory attention." },
    { icon: ClipboardCheck, title: "Administrative Automation", description: "Reduce manual tasks with automated client data updates, meeting prep summaries, and compliance documentation." },
    { icon: UserCheck, title: "Client Intelligence Dashboard", description: "Access a unified view of client financial behaviors, goals, and life events to power more meaningful conversations." }
  ];

  const useCases = [
    { icon: Home, title: "Home Purchase Planning", description: "Detect saving patterns indicating home buying intent and proactively offer mortgage and investment rebalancing advice." },
    { icon: GraduationCap, title: "Education Funding", description: "Identify families with education expenses approaching and recommend 529 plans or other education savings strategies." },
    { icon: Heart, title: "Life Milestone Support", description: "Recognize marriage, divorce, or family changes from spending patterns and offer appropriate financial guidance." },
    { icon: TrendingUp, title: "Investment Optimization", description: "Spot changes in client risk tolerance or cash flow to recommend portfolio adjustments at the right time." }
  ];

  const benefits = [
    "50% reduction in meeting prep time",
    "Earlier identification of client needs",
    "Improved client retention rates",
    "More meaningful client conversations"
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
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Wealth Management CoPilot</h1>
            </div>
            <p className="text-xl text-gray-500 max-w-3xl">
              Surface lifestyle events and behavioral insights that automate administrative tasks and create opportunities for proactive, meaningful client engagement.
            </p>
          </div>
        </section>

        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-500">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-500 leading-relaxed text-lg">
                Wealth advisors spend too much time on administrative tasks and too little on what matters most: building relationships and delivering advice. Ventus CoPilot analyzes transaction data to surface life events, behavioral changes, and opportunities that advisors would otherwise miss.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">See It In Action</h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <VentusWealthDemo />
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Empower Your Advisors?</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">Discover how Wealth CoPilot can free up advisor time and deepen client relationships.</p>
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

export default Wealth;
