import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, PieChart, Users, Globe, TrendingUp, Layers, Target, Eye, Lightbulb, ArrowUpRight } from "lucide-react";

const BankWideAnalytics = () => {
  const features = [
    { icon: PieChart, title: "Portfolio-Level Intelligence", description: "Aggregate enriched transaction data across your entire customer base to reveal macro spending trends, category shifts, and emerging behavioral patterns." },
    { icon: Users, title: "Behavioral Segmentation", description: "Automatically cluster customers into dynamic segments based on lifestyle signals, spending velocity, and life-stage indicators—not just demographics." },
    { icon: Globe, title: "Geographic Spend Mapping", description: "Visualize where your customers spend across states and regions, uncovering travel corridors, relocation patterns, and local economic engagement." },
    { icon: TrendingUp, title: "Trend Detection & Forecasting", description: "Identify category-level spending shifts before they become obvious—track seasonal patterns, emerging merchants, and wallet-share migration in real time." },
  ];

  const useCases = [
    { icon: Target, title: "Precision Marketing Campaigns", description: "Build hyper-targeted segments using behavioral and lifestyle dimensions, then deploy campaigns that reach the right customers at the right moment." },
    { icon: Layers, title: "Product Strategy & Cross-Sell", description: "Discover cross-sell opportunities by understanding which product combinations align with specific customer segments and life events." },
    { icon: Eye, title: "Competitive Intelligence", description: "Monitor wallet-share trends to understand where customers are spending outside your ecosystem and identify opportunities to recapture share." },
    { icon: Lightbulb, title: "Executive Decision Support", description: "Equip leadership with real-time dashboards showing portfolio health, segment growth, and revenue opportunity sizing across the institution." },
  ];

  const benefits = [
    "360° view of portfolio spending behavior",
    "AI-powered segment discovery and targeting",
    "Real-time geographic and demographic breakdowns",
    "Actionable cross-sell and retention insights",
  ];

  return (
    <div>
      <main className="pt-20 pb-10">
        <section className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Bank-Wide Analytics</h1>
            </div>
            <p className="text-xl text-gray-500 max-w-3xl">
              Turn millions of enriched transactions into portfolio-level intelligence—segment customers, spot trends, and size opportunities across your entire institution.
            </p>
          </div>
        </section>

        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-500">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-500 leading-relaxed text-lg">
                Most banks can tell you how much a customer spent. Ventus Bank-Wide Analytics tells you what your entire portfolio is doing—and why. By layering semantic enrichment across every transaction, we surface behavioral segments, geographic patterns, and revenue opportunities that traditional BI tools simply can't see. From marketing teams building campaigns to executives sizing new product launches, this is the intelligence layer that turns data into decisions.
              </p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to See Your Portfolio Differently?</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">Discover how Ventus Bank-Wide Analytics can power smarter decisions across marketing, product, and leadership.</p>
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

export default BankWideAnalytics;
