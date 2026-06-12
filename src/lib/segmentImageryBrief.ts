export interface ImageryBrief {
  query: string;
  keywords: string[];
  mood: string;
  composition: string;
  avoid: string[];
}

export function formatImageryBriefForClipboard(brief: ImageryBrief, productName: string, personaLabel: string): string {
  return [
    `Stock image brief`,
    `Product: ${productName}`,
    `Microsegment: ${personaLabel}`,
    `Query: ${brief.query}`,
    `Keywords: ${brief.keywords.join(", ")}`,
    `Mood: ${brief.mood}`,
    `Composition: ${brief.composition}`,
    `Avoid: ${brief.avoid.join(", ")}`,
  ].join("\n");
}
