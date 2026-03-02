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
      <article className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            to="/insights"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10"
          >
            <ArrowLeft className="h-4 w-4" />
            All Insights
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
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

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="rounded-2xl overflow-hidden my-10">
            <img src={insightsCover} alt="Ventus AI Insights" className="w-full h-56 object-cover" />
          </div>

          {/* Body */}
          <div className="prose prose-gray prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-600">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
};

export default InsightPost;
