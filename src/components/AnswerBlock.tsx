import type { QA } from "@/lib/seoSchema";

interface AnswerBlockProps {
  eyebrow?: string;
  heading?: string;
  items: QA[];
  className?: string;
}

/**
 * Short question -> direct answer blocks. Written in the 40-60 word format
 * that answer engines (AI Overviews, ChatGPT, Perplexity) quote directly.
 * Pair with faqSchema() on the same page.
 */
const AnswerBlock = ({
  eyebrow = "Common questions",
  heading,
  items,
  className = "",
}: AnswerBlockProps) => (
  <section className={`bg-white ${className}`} style={{ paddingTop: 72, paddingBottom: 72 }}>
    <div className="max-w-5xl mx-auto px-6 md:px-8">
      <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">{eyebrow}</p>
      {heading && (
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 leading-tight">{heading}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {items.map((item) => (
          <div key={item.q}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{item.q}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AnswerBlock;
