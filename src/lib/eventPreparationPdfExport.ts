import jsPDF from "jspdf";
import { EventPreparationData, LIFE_EVENT_CONFIG, DetectedLifeEvent } from "@/types/dashboardClient";
import { formatCurrency } from "@/lib/formatHelper";

const mockInsightsByEventType: Record<DetectedLifeEvent['eventType'], string> = {
  retirement: "This client is in the early exploration phase of retirement planning—a critical window for proactive engagement. The increased 401k contributions and AARP enrollment signal they're mentally preparing for this transition. Viking Cruises booking reveals aspirations for an active, travel-rich retirement. Estate planning consultations show they're thinking about legacy. Crucially, they haven't yet established dedicated retirement income vehicles—this is your opportunity to guide them on Roth conversions, income strategies, and trust structures before they go elsewhere.",
  education: "This parent is deep in the college planning research phase—the ideal moment for advisor involvement. SAT prep, Princeton Review enrollment, and campus visits indicate serious commitment. Admissions consulting and research subscriptions show they're gathering intelligence but haven't yet committed to funding strategies. This is your window to introduce 529 optimization, financial aid positioning, and parent-student loan comparisons before they make uninformed funding decisions.",
  home_purchase: "This client is in active home acquisition mode. The pattern of home improvement purchases before closing suggests they're preparing a new property for move-in, indicating deal momentum. Earnest money and closing cost payments confirm an imminent transaction. The moving rental booking shows a firm timeline. Expect questions about mortgage optimization, down payment sourcing, and how this purchase fits their broader wealth picture.",
  wealth_transfer: "A sophisticated wealth holder beginning to think intergenerationally. Goldman Sachs Private Wealth engagement shows they're seeking institutional-grade advice. Sotheby's appraisals reveal significant art or collectibles requiring specialized valuation. Family Wealth Alliance and Purposeful Planning seminars indicate they're educating themselves on governance and transfer strategies. They're in learning mode—not execution mode—making this the perfect time to position yourself as their trusted guide before they formalize structures elsewhere.",
  business_liquidity: "An entrepreneur approaching a transformational exit. The Merrill DataSite subscription and Deloitte advisory engagement indicate a sophisticated seller running a structured M&A process. IP valuation activity suggests they understand their business's intangible assets. The significant escrow deposit signals deal progression past LOI stage. This client needs holistic guidance on life after exit—investment of proceeds, tax minimization, and finding purpose post-business.",
  family_formation: "A growing family in the early stages of preparing for a new arrival—a pivotal moment for relationship deepening. Baby registry activity, nursery purchases, and maternity clothing signal nesting behavior. Hospital pre-registration and pregnancy tracking app subscriptions confirm timeline clarity. Notably, they haven't yet established education savings or updated estate documents—this is your opportunity to proactively introduce 529 plans, life insurance benchmarking, and guardianship planning before they're overwhelmed post-birth.",
  elder_care: "This client is stepping into a caregiver role for an aging family member. Medical alert system purchases and home accessibility modifications suggest a parent or in-law is transitioning to needing daily support. The assisted living deposit indicates they're exploring residential care options. Medicare supplement payments show active healthcare management. This is often emotionally complex—approach with empathy while addressing Medicaid planning, long-term care costs, and potential real estate decisions.",
};

export async function exportEventPreparationPDF(data: EventPreparationData): Promise<void> {
  const { client, event, transactions, recommendedSteps } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  const config = LIFE_EVENT_CONFIG[event.eventType];
  const eventLabel = config?.label || event.eventName;

  // Header - Event Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`PREPARE: ${eventLabel.toUpperCase()}`, 20, yPos);
  yPos += 8;

  // Client info line
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${client.profile.name} | ${client.profile.segment} | ${event.confidence}% confidence`, 20, yPos);
  yPos += 12;

  // Separator line
  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  // Detected Supporting Transactions Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`DETECTED SUPPORTING TRANSACTIONS (${transactions.length} total)`, 20, yPos);
  yPos += 8;

  // Sort transactions chronologically
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  sortedTransactions.forEach((txn) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    // Merchant and amount on one line
    const amountStr = formatCurrency(txn.amount);
    doc.setFont("helvetica", "bold");
    doc.text(txn.merchant, 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${amountStr}  ${txn.date}`, pageWidth - 20 - doc.getTextWidth(`${amountStr}  ${txn.date}`), yPos);
    yPos += 5;

    // Relevance on second line
    doc.setTextColor(100);
    doc.text(txn.relevance, 25, yPos);
    doc.setTextColor(0);
    yPos += 7;
  });

  yPos += 5;

  // Check for page break before insights
  if (yPos > 180) {
    doc.addPage();
    yPos = 20;
  }

  // Separator line
  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  // Ventus AI Insights Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("VENTUS AI INSIGHTS", 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const insights = mockInsightsByEventType[event.eventType];
  const insightLines = doc.splitTextToSize(insights, pageWidth - 45);
  
  insightLines.forEach((line: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 25, yPos);
    yPos += 5;
  });

  yPos += 8;

  // Check for page break before steps
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  // Separator line
  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  // Recommended Next Steps Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RECOMMENDED NEXT STEPS", 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  recommendedSteps.forEach((step, idx) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    const stepLines = doc.splitTextToSize(`${idx + 1}. ${step}`, pageWidth - 50);
    stepLines.forEach((line: string) => {
      doc.text(line, 25, yPos);
      yPos += 5;
    });
    yPos += 3;
  });

  yPos += 10;

  // Footer with timestamp
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }

  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setTextColor(120);
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  doc.text(`Generated: ${timestamp}`, 20, yPos);
  doc.setTextColor(0);

  // Generate filename and save
  const clientNameSlug = client.profile.name.replace(/\s+/g, '_');
  const eventTypeSlug = event.eventType.replace(/_/g, '-');
  doc.save(`${clientNameSlug}_${eventTypeSlug}_Preparation.pdf`);
}

export async function exportEventPreparationPDFBase64(data: EventPreparationData): Promise<string> {
  const { client, event, transactions, recommendedSteps } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  const config = LIFE_EVENT_CONFIG[event.eventType];
  const eventLabel = config?.label || event.eventName;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`PREPARE: ${eventLabel.toUpperCase()}`, 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${client.profile.name} | ${client.profile.segment} | ${event.confidence}% confidence`, 20, yPos);
  yPos += 12;

  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`DETECTED SUPPORTING TRANSACTIONS (${transactions.length} total)`, 20, yPos);
  yPos += 8;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  sortedTransactions.forEach((txn) => {
    if (yPos > 260) { doc.addPage(); yPos = 20; }
    const amountStr = formatCurrency(txn.amount);
    doc.setFont("helvetica", "bold");
    doc.text(txn.merchant, 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${amountStr}  ${txn.date}`, pageWidth - 20 - doc.getTextWidth(`${amountStr}  ${txn.date}`), yPos);
    yPos += 5;
    doc.setTextColor(100);
    doc.text(txn.relevance, 25, yPos);
    doc.setTextColor(0);
    yPos += 7;
  });

  yPos += 5;
  if (yPos > 180) { doc.addPage(); yPos = 20; }

  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("VENTUS AI INSIGHTS", 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const insights = mockInsightsByEventType[event.eventType];
  const insightLines = doc.splitTextToSize(insights, pageWidth - 45);
  insightLines.forEach((line: string) => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    doc.text(line, 25, yPos);
    yPos += 5;
  });

  yPos += 8;
  if (yPos > 200) { doc.addPage(); yPos = 20; }

  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RECOMMENDED NEXT STEPS", 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  recommendedSteps.forEach((step, idx) => {
    if (yPos > 260) { doc.addPage(); yPos = 20; }
    const stepLines = doc.splitTextToSize(`${idx + 1}. ${step}`, pageWidth - 50);
    stepLines.forEach((line: string) => {
      doc.text(line, 25, yPos);
      yPos += 5;
    });
    yPos += 3;
  });

  yPos += 10;
  if (yPos > 270) { doc.addPage(); yPos = 20; }

  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setTextColor(120);
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
  doc.text(`Generated: ${timestamp}`, 20, yPos);
  doc.setTextColor(0);

  const dataUri = doc.output("datauristring");
  return dataUri.split(",")[1];
}
