

## Add New Blog Post to Insights

### Overview
Add the article "AI Won't Replace Your Bank. But a Bank That Uses AI Will Replace Yours." as a new blog post in the existing Insights system.

### Changes

**1. Update `src/lib/insightsData.ts`**
- Add a new entry to the `insightsPosts` array with:
  - slug: `ai-wont-replace-your-bank`
  - title: "AI Won't Replace Your Bank. But a Bank That Uses AI Will Replace Yours."
  - category: "Industry"
  - author info in the body (By Marco -- Co-Founder & CEO, VentusAI)
  - date: "Feb 25, 2026"
  - readTime: "6 min read"
  - excerpt: Short summary about the attention gap and why banks need an intelligence layer
  - body: Full article content in markdown, cleaned up (removing cookie/site chrome from the scraped content, keeping the link to VentusAI at the end)

### Sections in the article body
1. The Attention Gap -- fintechs win on timing, not products
2. Intelligence Without Infrastructure Is Just a Demo -- AI pilots stall without orchestration
3. Your Data Is the Moat. You're Just Not Using It -- translation problem, not data problem
4. The Banks That Move Now Will Define the Category -- urgency and call to action

No new files, routes, or components needed -- the existing Insights page and InsightPost page will automatically pick up the new entry.

