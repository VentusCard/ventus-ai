import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/seoSchema";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { insightsPosts } from "@/lib/insightsData";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      <SEO title="Insights — Behavioral Intelligence for Banking" description="Research, product updates, and industry perspectives from the Ventus AI team on transaction enrichment, behavioral intelligence, and banking personalization." path="/insights" keywords="banking personalization research, transaction intelligence insights, behavioral intelligence banking blog" jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }])} />
      {/* Hero — white, centered */}
      <section className="pt-48 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4">Insights</p>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
            The Intelligence Brief
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Perspectives on behavioral intelligence, transaction data, and the future of personalized banking.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16">
          {/* Sidebar */}
          <aside className="space-y-10">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search posts"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-400 transition"
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Categories</p>
              <ul className="space-y-1">
                {ALL_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-md transition ${
                          isActive
                            ? "text-gray-900 font-semibold bg-blue-50/40"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Posts list */}
          <div className="max-w-[860px]">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500">No posts match your filters.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filtered.map((post) => (
                  <li key={post.slug}>
                    <Link
                      to={`/insights/${post.slug}`}
                      className="group block py-8"
                    >
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold mb-3 ${categoryColor[post.category] ?? ""}`}
                      >
                        {post.category}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-5 flex items-center gap-3 text-xs text-gray-500">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
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
