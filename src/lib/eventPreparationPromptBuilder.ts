import { EventPreparationData } from "@/types/dashboardClient";

/**
 * Builds a context-rich prompt for the Ventus AI chat panel
 * based on event preparation data from the dashboard
 */
export function buildEventPreparationPrompt(data: EventPreparationData): string {
  const { client, event, transactions, recommendedSteps } = data;
  
  const transactionEvidence = transactions.slice(0, 5).map(t => 
    `- ${t.merchant}: $${t.amount.toLocaleString()} (${t.cardType}) - ${t.relevance}`
  ).join('\n');
  
  const steps = recommendedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  
  return `I need to prepare for a client meeting about a detected ${event.eventName} event.

**Client:** ${client.profile.name} (${client.profile.segment})
**Event:** ${event.eventName} (${event.confidence}% confidence)
**Estimated Timing:** ${event.estimatedTiming}

**Key Evidence from Transactions:**
${transactionEvidence}

**Suggested Steps:**
${steps}

Help me prepare talking points and questions for this client conversation about their ${event.eventName} planning.`;
}
