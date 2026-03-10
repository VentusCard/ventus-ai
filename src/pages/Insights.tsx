import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { insightsPosts } from "@/lib/insightsData";
import insightsCover from "@/assets/insights-cover.png";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const categoryColor: Record<string, string> = {
  Product: "bg-blue-50 text-blue-700 border-blue-200",
  Industry: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Engineering: "bg-violet-50 text-violet-700 border-violet-200",
  Research: "bg-amber-50 text-amber-700 border-amber-200",
};

const Insights = () => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return insightsPosts;
    const q = query.toLowerCase();
    return insightsPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
  <main className="bg-white min-h-screen">
    {/* Hero Banner */}
    <section className="bg-[#0A0F1E] pt-28 pb-14 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Insights
        </h1>
        <p className="mt-3 text-base md:text-lg text-blue-200/70 max-w-3xl leading-relaxed">
          Perspectives on behavioral intelligence, transaction enrichment, and the future of data-driven banking.
        </p>
      </div>
    </section>

    {/* Search Bar */}
    <div className="px-6 -mt-6 relative z-10">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white shadow-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          />
        </div>
      </div>
    </div>

    {/* Grid */}
    <section className="pt-10 pb-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 0.08}>
            <Link
              to={`/insights/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full"
            >
              <div className="h-44 overflow-hidden">
                <img src={insightsCover} alt="Ventus AI Insights" className="w-full h-full object-cover" />
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
};

export default Insights;
