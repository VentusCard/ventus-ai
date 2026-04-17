import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { insightsPosts } from "@/lib/insightsData";
import insightsCover from "@/assets/insights-cover.png";
import { Badge } from "@/components/ui/badge";
import { Search, Newspaper } from "lucide-react";

const categoryColor: Record<string, string> = {
  Product: "bg-blue-50 text-blue-700 border-blue-200",
  Industry: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Engineering: "bg-violet-50 text-violet-700 border-violet-200",
  Research: "bg-amber-50 text-amber-700 border-amber-200",
};

const ALL_CATEGORIES = ["All", "Product", "Industry", "Engineering", "Research"] as const;
type Category = typeof ALL_CATEGORIES[number];

const Insights = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: insightsPosts.length };
    insightsPosts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return insightsPosts.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero — white, centered */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 mb-6">
            <Newspaper className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Insights</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
            Notes From the Team
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Perspectives on behavioral intelligence, transaction enrichment, and the future of data-driven banking.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="space-y-10">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-3">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition"
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-3">Categories</p>
              <ul className="space-y-1">
                {ALL_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full flex items-center justify-between text-left text-sm pl-3 pr-2 py-2 rounded-md transition border-l-2 ${
                          isActive
                            ? "border-blue-600 text-gray-900 font-semibold bg-blue-50/40"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-xs ${isActive ? "text-blue-600" : "text-gray-400"}`}>{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Posts list */}
          <div>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500">No posts match your filters.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filtered.map((post) => (
                  <li key={post.slug}>
                    <Link
                      to={`/insights/${post.slug}`}
                      className="group grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 py-8 items-start"
                    >
                      <div>
                        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-3">
                          {post.category}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {post.title}
                        </h2>
                        <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="mt-5 flex items-center gap-3 text-xs text-gray-400">
                          <span>{post.date}</span>
                          <span>·</span>
                          <span>{post.readTime}</span>
                          <Badge
                            variant="outline"
                            className={`ml-2 text-[10px] font-semibold ${categoryColor[post.category] ?? ""}`}
                          >
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="hidden md:block aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={insightsCover}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Insights;
