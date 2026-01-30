import jsPDF from "jspdf";
import { SavedFinancialProjection } from "@/types/lifestyle-signals";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

const projectTypeLabels: Record<string, string> = {
  education: "Education",
  home: "Home Purchase",
  retirement: "Retirement",
  business: "Business",
  wedding: "Wedding",
  medical: "Medical",
  other: "Custom",
};

export async function exportFinancialTimelinePDF(projection: SavedFinancialProjection): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(projection.projectName, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Project Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const typeLabel = projectTypeLabels[projection.projectType] || projection.projectType;
  doc.text(`Project Type: ${typeLabel}`, 20, yPos);
  yPos += 6;
  doc.text(`Timeline: ${projection.startYear} - ${projection.startYear + projection.duration - 1} (${projection.duration} years)`, 20, yPos);
  yPos += 6;
  doc.text(`Current Savings: ${formatCurrency(projection.currentSavings)}`, 20, yPos);
  yPos += 6;
  doc.text(`Monthly Contribution: ${formatCurrency(projection.monthlyContribution)}`, 20, yPos);
  yPos += 10;

  // Add chart image if available
  if (projection.chartImageDataUrl) {
    try {
      const img = new Image();
      img.src = projection.chartImageDataUrl;
      
      // Wait for image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        // Timeout after 3 seconds
        setTimeout(resolve, 3000);
      });

      const imgWidth = pageWidth - 40;
      const imgHeight = (img.height * imgWidth) / img.width;

      if (yPos + imgHeight > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Cash Flow Projection", 20, yPos);
      yPos += 10;

      doc.addImage(projection.chartImageDataUrl, "PNG", 20, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 10;

      doc.addPage();
      yPos = 20;
    } catch (error) {
      console.error("Error adding chart image to PDF:", error);
    }
  }

  // Calculate years for cost breakdown
  const years = Array.from({ length: projection.duration }, (_, i) => projection.startYear + i);

  // Cost Breakdown
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Cost Breakdown by Year", 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  years.forEach((year) => {
    const yearCost = projection.costCategories.reduce((sum, cat) => sum + (cat.amounts[year] || 0), 0);
    doc.text(`${year}: ${formatCurrency(yearCost)}`, 25, yPos);
    yPos += 5;

    projection.costCategories.forEach((cat) => {
      if (cat.amounts[year]) {
        doc.text(`  - ${cat.label}: ${formatCurrency(cat.amounts[year])}`, 30, yPos);
        yPos += 5;
      }
    });

    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  yPos += 5;

  // Funding Sources
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Funding Sources", 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  projection.fundingSources.forEach((source) => {
    doc.text(`${source.label}:`, 25, yPos);
    yPos += 5;

    Object.entries(source.amounts).forEach(([year, amount]) => {
      if (amount) {
        doc.text(`  ${year}: ${formatCurrency(amount)}`, 30, yPos);
        yPos += 5;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      }
    });
    yPos += 3;
  });

  yPos += 5;

  // Summary
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const totalCost = projection.costCategories.reduce((sum, cat) => {
    return sum + Object.values(cat.amounts).reduce((s, v) => s + (v || 0), 0);
  }, 0);

  const totalFunding = projection.fundingSources.reduce((sum, source) => {
    return sum + Object.values(source.amounts).reduce((s, v) => s + (v || 0), 0);
  }, 0);

  const fundingGap = totalCost - totalFunding;

  doc.text(`Total Projected Cost: ${formatCurrency(totalCost)}`, 25, yPos);
  yPos += 6;
  doc.text(`Total Funding: ${formatCurrency(totalFunding)}`, 25, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Funding Gap: ${formatCurrency(fundingGap)}`, 25, yPos);
  yPos += 10;

  // Action Items
  if (projection.actionItems.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text("Action Items", 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    projection.actionItems.forEach((item) => {
      const checkbox = item.completed ? "[✓]" : "[ ]";
      doc.text(`${checkbox} ${item.timing}:`, 25, yPos);
      yPos += 5;

      const actionLines = doc.splitTextToSize(item.action, pageWidth - 50);
      actionLines.forEach((line: string) => {
        doc.text(line, 30, yPos);
        yPos += 5;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    });
  }

  // Save PDF
  doc.save(`${projection.projectName.replace(/\s+/g, "_")}_Timeline.pdf`);
}
