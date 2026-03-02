import { Link } from "react-router-dom";
import { insightsPosts } from "@/lib/insightsData";
import insightsCover from "@/assets/insights-cover.png";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";

const categoryColor: Record<string, string> = {
  Product: "bg-blue-50 text-blue-700 border-blue-200",
  Industry: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Engineering: "bg-violet-50 text-violet-700 border-violet-200",
  Research: "bg-amber-50 text-amber-700 border-amber-200",
};

const Insights = () => (
  <main className="bg-white min-h-screen">
    {/* Hero */}
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Insights
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Perspectives on behavioral intelligence, transaction enrichment, and the future of data-driven banking.
        </p>
      </div>
    </section>

    {/* Grid */}
    <section className="pb-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {insightsPosts.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 0.08}>
            <Link
              to={`/insights/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full"
            >
              {/* Placeholder image area */}
              <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                <span className="text-gray-300 text-sm font-medium tracking-wide">
                  VENTUS INSIGHTS
                </span>
              </div>

              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold ${categoryColor[post.category] ?? ""}`}
                  >
                    {post.category}
                  </Badge>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">
                  {post.excerpt}
                </p>

                <p className="mt-4 text-xs text-gray-400">{post.date}</p>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  </main>
);

export default Insights;
