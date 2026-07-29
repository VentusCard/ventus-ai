import SEO from "@/components/SEO";
import { articleSchema, breadcrumbSchema } from "@/lib/seoSchema";
import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { insightsPosts } from "@/lib/insightsData";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import insightsCover from "@/assets/insights-cover.png";

const categoryColor: Record<string, string> = {
  Product: "bg-blue-50 text-blue-700 border-blue-200",
  Industry: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Engineering: "bg-violet-50 text-violet-700 border-violet-200",
  Research: "bg-amber-50 text-amber-700 border-amber-200",
};

const InsightPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = insightsPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/insights" replace />;

  return (
    <main className="bg-white min-h-screen">
      <SEO
        title={`${post.title} — Ventus AI`}
        description={post.excerpt}
        path={`/insights/${post.slug}`}
        type="article"
        jsonLd={[
          articleSchema({
            headline: post.title,
            description: post.excerpt,
            path: `/insights/${post.slug}`,
            datePublished: new Date(post.date).toISOString().slice(0, 10),
            section: post.category,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
            { name: post.title, path: `/insights/${post.slug}` },
          ]),
        ]}
      />
      <article className="pt-40 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            to="/insights"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            All Insights
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-6">
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold ${categoryColor[post.category] ?? ""}`}
            >
              {post.category}
            </Badge>
            <span className="text-xs text-gray-400">
              {post.date} · {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.15]">
            {post.title}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="rounded-2xl overflow-hidden my-14">
            <img src={insightsCover} alt="Ventus AI Insights" className="w-full h-56 object-cover" />
          </div>

          {/* Body */}
          <div className="insight-prose prose prose-lg max-w-none text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-em:text-gray-700 prose-blockquote:border-blue-500 prose-blockquote:text-gray-600 [&_h1]:!text-gray-900 [&_h2]:!text-gray-900 [&_h3]:!text-gray-900 [&_h4]:!text-gray-900 [&_h2]:!text-3xl [&_h2]:!font-bold [&_h2]:!mt-16 [&_h2]:!mb-6 [&_h2]:!leading-tight [&_h3]:!text-2xl [&_h3]:!font-bold [&_h3]:!mt-12 [&_h3]:!mb-5 [&_h3]:!leading-snug [&_p]:!text-gray-700 [&_p]:!leading-[1.85] [&_p]:!my-6 [&_li]:!text-gray-700 [&_li]:!leading-[1.8] [&_li]:!my-2 [&_ul]:!my-8 [&_ol]:!my-8 [&_hr]:!my-14 [&_blockquote]:!my-8">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
};

export default InsightPost;
