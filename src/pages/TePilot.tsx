import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Brain, Zap, CheckCircle, ArrowRight, ArrowLeft, Upload, BarChart3, Scan, RefreshCw, TrendingUp, Sparkles, Gift, Users, MapPin, Briefcase, PieChart, Shield, Building2, Award, TrendingDown, Loader2, ShoppingBag, CalendarClock, CalendarHeart, MessageSquare, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Transaction, EnrichedTransaction, Correction, Filters } from "@/types/transaction";
import { ClientProfileData } from "@/types/clientProfile";
import { UploadOrPasteContainer } from "@/components/tepilot/UploadOrPasteContainer";
import { PasteInput } from "@/components/tepilot/PasteInput";
import { FileUploader } from "@/components/tepilot/FileUploader";
import { PreviewTable } from "@/components/tepilot/PreviewTable";
import { EnrichActionBar } from "@/components/tepilot/EnrichActionBar";
import { ResultsTable } from "@/components/tepilot/ResultsTable";
import { ExportControls } from "@/components/tepilot/ExportControls";
import { FilterControls } from "@/components/tepilot/FilterControls";
import { OverviewMetrics } from "@/components/tepilot/insights/OverviewMetrics";
import { TravelTimeline } from "@/components/tepilot/insights/TravelTimeline";
import { PillarExplorer } from "@/components/tepilot/insights/PillarExplorer";
import { BeforeAfterTransformation } from "@/components/tepilot/insights/BeforeAfterTransformation";
import { BankwideView } from "@/components/tepilot/insights/BankwideView";

import { RelationshipManagementCard } from "@/components/tepilot/RelationshipManagementCard";
import { AdvisorConsole } from "@/components/tepilot/advisor-console/AdvisorConsole";
import { PersonaCard } from "@/components/tepilot/PersonaCard";

import { ColumnMapper } from "@/components/tepilot/ColumnMapper";
import { parseFile, parseMultipleFiles, parsePastedText, mapColumnsWithMapping, type MappingResult } from "@/lib/parsers";
import { applyFilters, applyCorrections } from "@/lib/aggregations";
import { extractLocationContext } from "@/lib/geoLocationUtils";
import { supabase } from "@/integrations/supabase/client";
import { useSSEEnrichment } from "@/hooks/useSSEEnrichment";
import { AIInsights } from "@/types/lifestyle-signals";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { SubcategoryTransactionsModal } from "@/components/tepilot/insights/SubcategoryTransactionsModal";
import { TransactionDetailModal } from "@/components/tepilot/TransactionDetailModal";
import { TopPillarsAnalysis } from "@/components/tepilot/insights/TopPillarsAnalysis";
import { DealActivationPreview } from "@/components/tepilot/insights/DealActivationPreview";
import { CollapsibleCard } from "@/components/tepilot/insights/CollapsibleCard";
const CURRENT_VERSION = "V2.5";
const TePilot = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if navigation state specifies a tab
    const navState = location.state as {
      activeTab?: string;
      insightType?: 'revenue' | 'relationship' | 'bankwide';
    } | null;
    return navState?.activeTab || "upload";
  });
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [activeSelection, setActiveSelection] = useState<"sample" | "paste" | "upload">("sample");
  const [rawInput, setRawInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [anchorZip, setAnchorZip] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);
  const [corrections, setCorrections] = useState<Map<string, Correction>>(new Map());
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
  const [userPersona, setUserPersona] = useState<any>(null);
  const [analyticsView, setAnalyticsView] = useState<"single" | "bankwide">("single");
  const [insightType, setInsightType] = useState<'revenue' | 'relationship' | 'bankwide' | null>(() => {
    // Check URL search params first, then navigation state
    const viewParam = searchParams.get('view');
    if (viewParam === 'bankwide') return 'bankwide';
    const navState = location.state as { insightType?: 'revenue' | 'relationship' | 'bankwide' } | null;
    return navState?.insightType || null;
  });
  const [lifestyleSignals, setLifestyleSignals] = useState<AIInsights | null>(null);
  const [isLoadingLifestyleSignals, setIsLoadingLifestyleSignals] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{ subcategory: string; pillar: string } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EnrichedTransaction | null>(null);
  const [userDemographics, setUserDemographics] = useState<ClientProfileData | null>(null);
  const [isFromSampleData, setIsFromSampleData] = useState(false);
  const navigate = useNavigate();
  const handleNavigateToAdvisorConsole = async () => {
    // Ensure analysis runs before navigating if not already done
    if (!lifestyleSignals && enrichedTransactions.length > 0) {
      toast.info('Running lifestyle analysis...');
      await fetchLifestyleSignals();
      // Data already saved to sessionStorage inside fetchLifestyleSignals
    } else if (lifestyleSignals) {
      // Only save when using existing lifestyleSignals state
      sessionStorage.setItem("tepilot_advisor_context", JSON.stringify({
        enrichedTransactions: enrichedTransactions,
        aiInsights: lifestyleSignals,
        userDemographics: userDemographics
      }));
    }
    navigate('/tepilot/advisor-console');
  };

  // SSE Enrichment Hook
  const {
    enrichedTransactions,
    isProcessing,
    statusMessage,
    currentPhase,
    error: enrichmentError,
    startEnrichment,
    resetEnrichment,
    restoreEnrichedTransactions
  } = useSSEEnrichment();
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      start: null,
      end: null
    },
    confidenceThreshold: 0,
    includeMisc: true,
    mode: "predicted"
  });

  // New state for column mapping
  const [pendingMapping, setPendingMapping] = useState<{
    headers: string[];
    rows: any[];
    suggestedMapping: Record<string, string | null>;
  } | null>(null);
  useEffect(() => {
    // Restore authentication states
    const auth = sessionStorage.getItem("tepilot_auth");
    if (auth === "authenticated") setIsAuthenticated(true);

    // Restore parsed transactions
    const storedParsed = sessionStorage.getItem("tepilot_parsed_transactions");
    if (storedParsed) {
      try {
        const parsed = JSON.parse(storedParsed);
        setParsedTransactions(parsed);
        console.log(`[TePilot] Restored ${parsed.length} parsed transactions`);
      } catch (e) {
        console.error("Error restoring parsed transactions:", e);
      }
    }

    // Restore enriched transactions
    const storedEnriched = sessionStorage.getItem("tepilot_enriched_transactions");
    if (storedEnriched) {
      try {
        const enriched = JSON.parse(storedEnriched);
        restoreEnrichedTransactions(enriched);
        setActiveTab("results");
        console.log(`[TePilot] Restored ${enriched.length} enriched transactions`);
      } catch (e) {
        console.error("Error restoring enriched transactions:", e);
      }
    }

    // Restore AI insights from advisor context
    const advisorContext = sessionStorage.getItem("tepilot_advisor_context");
    if (advisorContext) {
      try {
        const contextData = JSON.parse(advisorContext);
        if (contextData.aiInsights) {
          setLifestyleSignals(contextData.aiInsights);
        }
      } catch (error) {
        console.error("Error restoring AI insights:", error);
      }
    }

    // Restore user persona
    const storedPersona = sessionStorage.getItem("tepilot_user_persona");
    if (storedPersona) {
      try {
        const persona = JSON.parse(storedPersona);
        setUserPersona(persona);
        console.log("[TePilot] Restored user persona");
      } catch (error) {
        console.error("Error restoring user persona:", error);
      }
    }

    // Restore user demographics
    const storedDemographics = sessionStorage.getItem("tepilot_user_demographics");
    if (storedDemographics) {
      try {
        const demographics = JSON.parse(storedDemographics);
        setUserDemographics(demographics);
        // Also restore anchor ZIP from demographics
        const zipMatch = demographics.contact?.address?.match(/\d{5}$/);
        if (zipMatch) {
          setAnchorZip(zipMatch[0]);
        }
        console.log("[TePilot] Restored user demographics");
      } catch (error) {
        console.error("Error restoring user demographics:", error);
      }
    }
  }, []);

  // Handle navigation state changes (e.g., from Bank-wide to Revenue Recommendations)
  useEffect(() => {
    const navState = location.state as { 
      activeTab?: string; 
      insightType?: 'revenue' | 'relationship' | 'bankwide';
    } | null;
    
    if (navState?.activeTab) {
      setActiveTab(navState.activeTab);
    }
    if (navState?.insightType) {
      setInsightType(navState.insightType);
    }
  }, [location.state]);

  // Persist enriched transactions when enrichment completes
  useEffect(() => {
    if (enrichedTransactions.length > 0 && currentPhase === 'complete') {
      sessionStorage.setItem("tepilot_enriched_transactions", JSON.stringify(enrichedTransactions));
      console.log(`[TePilot] Persisted ${enrichedTransactions.length} enriched transactions`);
    }
  }, [enrichedTransactions, currentPhase]);

  // Persist parsed transactions when they change
  useEffect(() => {
    if (parsedTransactions.length > 0) {
      sessionStorage.setItem("tepilot_parsed_transactions", JSON.stringify(parsedTransactions));
    }
  }, [parsedTransactions]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2026proto") {
      setIsAuthenticated(true);
      sessionStorage.setItem("tepilot_auth", "authenticated");
      toast.success("Access granted");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };
  const handleParse = async (files?: File[]) => {
    try {
      let result: MappingResult;
      if (inputMode === "paste") {
        // Prepend Home ZIP Code header if parsing pasted text
        let textToParse = rawInput;

        // Check if the text already has a Home ZIP Code header
        const firstLine = textToParse.trim().split("\n")[0];
        const hasZipHeader = firstLine.startsWith("#") && firstLine.toLowerCase().includes("zip");

        // If no existing header, add one with the anchor ZIP (or N/A if empty)
        if (!hasZipHeader) {
          const zipValue = anchorZip.trim() || "N/A";
          textToParse = `# Home ZIP Code: ${zipValue}\n${textToParse}`;
        }
        result = parsePastedText(textToParse);
      } else if (files && files.length > 0) {
        // Multi-file parsing with progress
        const progressToast = toast.loading("Processing files...");
        result = await parseMultipleFiles(files, anchorZip, (current, total, fileName) => {
          toast.loading(`Processing ${current} of ${total}: ${fileName}`, {
            id: progressToast
          });
        });
        toast.dismiss(progressToast);
      } else if (uploadedFiles.length > 0) {
        // Use stored files
        const progressToast = toast.loading("Processing files...");
        result = await parseMultipleFiles(uploadedFiles, anchorZip, (current, total, fileName) => {
          toast.loading(`Processing ${current} of ${total}: ${fileName}`, {
            id: progressToast
          });
        });
        toast.dismiss(progressToast);
      } else {
        toast.error("No data to parse");
        return;
      }
      if (result.needsMapping) {
        // Show column mapper
        setPendingMapping({
          headers: result.headers!,
          rows: result.rows!,
          suggestedMapping: result.suggestedMapping!
        });
        toast.info("Please map your columns to continue");
      } else {
        // Auto-mapping succeeded - show preview with manual enrichment button
        setParsedTransactions(result.transactions!);
        setRecommendations(null); // Clear old recommendations
        toast.success(`Parsed ${result.transactions!.length} transactions - ready to enrich`);
        setActiveTab("preview");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleMappingConfirm = async (mapping: Record<string, string>) => {
    try {
      if (!pendingMapping) return;
      const transactions = mapColumnsWithMapping(pendingMapping.headers, pendingMapping.rows, mapping);
      setParsedTransactions(transactions);
      setRecommendations(null); // Clear old recommendations
      setPendingMapping(null);
      toast.success(`Parsed ${transactions.length} transactions - ready to enrich`);
      setActiveTab("preview");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleMappingCancel = () => {
    setPendingMapping(null);
    toast.info("Column mapping cancelled");
  };
  const handleEnrich = async () => {
    setRecommendations(null); // Clear old recommendations
    setActiveTab("results"); // Switch to results IMMEDIATELY
    await startEnrichment(parsedTransactions, anchorZip);
  };
  const handleCorrection = async (transactionId: string, correctedPillar: string, correctedSubcategory: string, reason: string) => {
    const transaction = enrichedTransactions.find(t => t.transaction_id === transactionId);
    if (!transaction) return;
    const correction: Correction = {
      transaction_id: transactionId,
      original_pillar: transaction.pillar,
      corrected_pillar: correctedPillar,
      original_subcategory: transaction.subcategory,
      corrected_subcategory: correctedSubcategory,
      reason,
      corrected_at: new Date().toISOString()
    };
    const newCorrections = new Map(corrections.set(transactionId, correction));
    setCorrections(newCorrections);

    // Send feedback to AI for training (fire-and-forget)
    supabase.functions.invoke('send-feedback', {
      body: {
        transaction,
        correction
      }
    }).catch(err => console.log("Feedback sending failed (non-critical):", err));
    toast.success("Correction applied and feedback sent to AI for training!");
  };
  // Always apply corrections, then apply filters
  const displayTransactions = applyCorrections(enrichedTransactions, corrections);
  const filteredTransactions = applyFilters(displayTransactions, filters);

  // Extract location context for geo-based deals - always computed at top level
  const locationContext = useMemo(() => extractLocationContext(displayTransactions), [displayTransactions]);
  const fetchLifestyleSignals = async () => {
    if (enrichedTransactions.length === 0) {
      toast.error('No enriched transactions available. Please enrich transactions first.');
      return;
    }
    setIsLoadingLifestyleSignals(true);
    try {
      // Prepare transaction data (recent transactions)
      const recentTransactions = enrichedTransactions.slice(0, 100);

      // Calculate spending summary
      const totalSpend = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const categoryMap = new Map<string, number>();
      recentTransactions.forEach(t => {
        const current = categoryMap.get(t.pillar) || 0;
        categoryMap.set(t.pillar, current + 1);
      });
      const topCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category]) => category);
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-lifestyle-signals', {
        body: {
          client: {
            id: 'current-client',
            name: 'Emma R.',
            age: 42,
            occupation: 'Senior Product Manager',
            family_status: 'Married, 1 child'
          },
          transactions: recentTransactions.map(t => ({
            merchant: t.description,
            amount: t.amount,
            date: t.date,
            category: t.pillar,
            subcategory: t.subcategory
          })),
          spending_summary: {
            total_spend: totalSpend,
            top_categories: topCategories
          }
        }
      });
      if (error) {
        console.error('Error fetching lifestyle signals:', error);
        toast.error('Failed to analyze lifestyle signals');
        return;
      }
      setLifestyleSignals(data);

      // Store context for AdvisorConsole page
      sessionStorage.setItem("tepilot_advisor_context", JSON.stringify({
        enrichedTransactions: enrichedTransactions,
        aiInsights: data
      }));
      toast.success(`Analysis complete! Detected ${data.detected_events?.length || 0} life events`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to analyze lifestyle signals');
    } finally {
      setIsLoadingLifestyleSignals(false);
    }
  };
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-white p-4 tepilot-container">
        <Card className="w-full max-w-6xl bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-900">Ventus AI Transaction Enrichment & Personalization Engine</CardTitle>
            <CardDescription className="text-base text-slate-600">
              Unlock deep customer insights from existing data with next-generation contextual AI
              <Accordion type="single" collapsible className="w-full mt-2">
                <AccordionItem value="release-notes" className="border-none">
                  <AccordionTrigger className="text-sm text-slate-900 py-1 hover:no-underline">
                    <span><span className="font-semibold">Release Notes ({CURRENT_VERSION})</span> <span className="text-xs text-slate-500 font-normal">— Deal messaging personalization engine and merchant aggregator compatibility layer</span></span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-slate-500 space-y-2">
                    <div className="border-l-2 border-blue-600 pl-3 py-1">
                      <p className="font-semibold">V2.5 - Current</p>
                      <p>Deal messaging personalization engine for dynamic customer-specific deal messaging, plus merchant aggregator compatibility layer for seamless integration with third-party deal providers</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V2.4 - January 2026</p>
                      <p>Parent-SKU purchase inference and seasonality purchase correlation intelligence, updated WM-CoPilot to detect 15 major life events</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V2.3 - December 2025</p>
                      <p>Added more features into wealth management tool, unlocked</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V2.2 - December 2025</p>
                      <p>Improved user experience with tool selection tab</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V2.1 - November 2025</p>
                      <p>Upgraded merchant deal generation and core wealth management tools</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V2.0 - November 2025</p>
                      <p>Added bank-wide macro analytics tool. Now allows user to upload multiple files to process.</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V1.4 - October 2025</p>
                      <p>Support for multiple file uploads including PDF bank statements (MCCs might not be available in PDFs)</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V1.3 - October 2025</p>
                      <p>Third working AI flow generating revenue opportunities based on holistic customer spending profile</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V1.2 - October 2025</p>
                      <p>Added smart travel detection system (pattern training) with double labeling</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V1.1 - September 2025</p>
                      <p>Enhanced merchant categorization with improved semantic matching</p>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <p className="font-semibold text-slate-700">V1.0 - September 2025</p>
                      <p>Initial release with AI-powered transaction enrichment and classification</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <div className="prose prose-sm max-w-none text-slate-600">
              <p>
                Traditional transaction categorization relies on outdated methods like MCC codes or simple text matching, 
                often producing generic or incorrect results. <strong className="text-slate-900">Ventus AI uses semantic understanding</strong> to 
                analyze the full context of each transaction, delivering accurate lifestyle-based categorization that 
                understands what you're actually spending on. This enables financial institutions to unlock richer consumer insights and <strong className="text-slate-900">turning vast, unstructured transaction data into actionable intelligence.</strong>
              </p>
            </div>

            {/* Accordion with 3 collapsible sections */}
            <Accordion type="single" collapsible className="w-full">
              {/* Section 1: Ventus AI Workflows */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold group text-slate-900">
                  <div className="flex flex-col items-start gap-1 text-left">
                    <span>Ventus AI Workflows</span>
                    <span className="text-sm font-normal text-slate-500 group-data-[state=closed]:block group-data-[state=open]:hidden">
                      Three workflows transform raw data to insights
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-sm text-slate-900">Transaction Enrichment</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Semantic AI enriches raw transaction data with lifestyle categories, merchant context, and travel indicators, each tagged with confidence scores and explanations for quality assurance.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-sm text-slate-900">Pattern Analysis & Prediction</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Uncover hidden spending behaviors and trends across lifestyle pillars, merchant patterns, and travel behaviors for deeper customer understanding. <span className="text-primary">Prediction capabilities coming soon.</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-sm text-slate-900">Insights and Recommendation</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Transform insights into actionable marketing signals and reward engine parameters, ready for seamless integration into your customer engagement platforms.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: Why Semantic AI is Different */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold group text-slate-900">
                  <div className="flex flex-col items-start gap-1 text-left">
                    <span>Why Semantic AI is Different</span>
                    <span className="text-sm font-normal text-slate-500 group-data-[state=closed]:block group-data-[state=open]:hidden">
                      AI delivers accuracy legacy methods can't match
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold text-slate-900">Approach</TableHead>
                          <TableHead className="font-semibold text-slate-900">Example Transaction</TableHead>
                          <TableHead className="font-semibold text-slate-900">Categorization</TableHead>
                          <TableHead className="font-semibold text-slate-900">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-slate-900">MCC-Based</TableCell>
                          <TableCell className="font-mono text-sm text-slate-700">Ticketmaster* Sabrina Carpenter</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                              Events
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">Too generic</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-slate-900">Text-Based</TableCell>
                          <TableCell className="font-mono text-sm text-slate-700">Ticketmaster* Sabrina Carpenter</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-500/20">
                              Furniture
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">Completely wrong</TableCell>
                        </TableRow>
                        <TableRow className="bg-green-500/5">
                          <TableCell className="font-medium text-slate-900">Ventus AI (Semantic)</TableCell>
                          <TableCell className="font-mono text-sm text-slate-700">Ticketmaster* Sabrina Carpenter</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                              Entertainment & Culture
                            </Badge>
                          </TableCell>
                          <TableCell className="text-green-700 font-medium text-sm flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Accurate and insightful
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 3: Key Features */}
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold group text-slate-900">
                  <div className="flex flex-col items-start gap-1 text-left">
                    <span>Key Features <span className="text-primary">(New!)</span></span>
                    <span className="text-sm font-normal text-slate-500 group-data-[state=closed]:block group-data-[state=open]:hidden">
                      Full-stack AI capabilities from enrichment to personalization
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Context-Aware</h4>
                        <p className="text-sm text-slate-600">
                          Recognizes messy transactions like "PAYPAL *UBER" or "APPLE PAY STARBUCKS" and extracts the true merchant for accurate classification
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Semantic Intelligence</h4>
                        <p className="text-sm text-slate-600">
                          Infinitely scalable knowledge base that continuously learns new merchants, categories, and spending patterns without manual updates
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Multi-Category Mapping</h4>
                        <p className="text-sm text-slate-600">
                          Semantic merchant clustering maps disparate entities (Titleist, Country Club, PGA Superstore) to unified Sports → Golf taxonomy
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Higher Accuracy</h4>
                        <p className="text-sm text-slate-600">
                          Multi-algorithm ensemble dynamically routes each task to the optimal model for maximum classification precision
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Scan className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Pattern Recognition</h4>
                        <p className="text-sm text-slate-600">
                          Currently detects travel spending patterns and destinations. Additional behavioral patterns in training to unlock deeper insights.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Personalized Deals & Rewards</h4>
                        <p className="text-sm text-slate-600">
                          Lifestyle pillar signals power rewritten deal descriptions and precision deployment from your rewards aggregator
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <ShoppingBag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Parent-SKU Level Inference</h4>
                        <p className="text-sm text-slate-600">
                          Uses price-matching and merchant context to infer specific purchases (e.g., "$58.57 Titleist → dozen Pro V1 golf balls + tax") rather than generic "merchandise"
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <CalendarClock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Merchant Deal Timing Optimization</h4>
                        <p className="text-sm text-slate-600">
                          Analyzes 52-week spending patterns to identify optimal weeks for merchant promotions, maximizing campaign ROI
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <CalendarHeart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Life Event Financial Planning</h4>
                        <p className="text-sm text-slate-600">
                          Automatically detects life events (new baby, home purchase, career change) and generates multi-year financial projections
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Wealth Management Relationship Co-Pilot</h4>
                        <p className="text-sm text-slate-600">
                          AI advisor chatbot with client psychology profiling, transaction-grounded insights, and Monte Carlo retirement planning
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 group">
                  <div className="flex flex-col items-start gap-1 text-left">
                    <span>Use Cases</span>
                    <span className="text-sm font-normal text-slate-500 group-data-[state=closed]:block group-data-[state=open]:hidden">
                      Real-world applications across financial services
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Personalized Deal Recommendations</h4>
                        <p className="text-sm text-slate-600">
                          Generate targeted merchant offers based on actual spending patterns. A customer who spends $800/month at Whole Foods receives automated 15% cashback offers at premium grocery stores.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Customer Segmentation & Profiling</h4>
                        <p className="text-sm text-slate-600">
                          Automatically segment customers into lifestyle personas (Premium Travelers, Home Enthusiasts, Fitness Focused) for precision marketing and product recommendations.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Travel Pattern Intelligence</h4>
                        <p className="text-sm text-slate-600">
                          Detect travel destinations, frequency, and spending patterns. Identify luxury travelers for premium card upsells or frequent visitors for location-based partnership deals.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Cross-Sell Optimization</h4>
                        <p className="text-sm text-slate-600">
                          Identify customers spending heavily on home improvement for HELOC offers, or high restaurant spenders for dining rewards cards with matched earn rates.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <PieChart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Portfolio Analytics</h4>
                        <p className="text-sm text-slate-600">
                          Aggregate insights across millions of accounts to identify spending gaps, card product fit, and revenue opportunities at bank-wide scale.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <Briefcase className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-slate-900">Wealth Management Intelligence</h4>
                        <p className="text-sm text-slate-600">
                          Provide advisors with conversation-ready insights: detect life events (new home purchase), spending increases (new baby), and personalized product recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            {/* Password Form */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Enter Password to Continue</h3>
              <p className="text-sm text-slate-600 mb-4">
                All data processing is ephemeral. Your transaction data is analyzed in real-time and never stored on our servers.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  type="password" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  autoFocus 
                  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                />
                <Button type="submit" className="w-full">
                  Access Pilot
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-white p-4 md:p-8 tepilot-container">
      <div className="max-w-[95%] 2xl:max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Ventus AI Transaction Enrichment & Personalization Engine</h1>
            <p className="text-slate-600 mt-2">Unlock deep customer insights from existing data with next-generation contextual AI</p>
          </div>
        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900" onClick={() => {
          // Clear authentication
          sessionStorage.removeItem("tepilot_auth");
          setIsAuthenticated(false);

          // Clear all transaction data
          setParsedTransactions([]);
          setCorrections(new Map());

          // Clear enrichment state
          resetEnrichment();
          setRecommendations(null); // Clear old recommendations

          // Clear persisted transaction data
          sessionStorage.removeItem("tepilot_enriched_transactions");
          sessionStorage.removeItem("tepilot_parsed_transactions");
          sessionStorage.removeItem("tepilot_advisor_context");
          sessionStorage.removeItem("tepilot_user_demographics");

          // Clear all input data
          setRawInput("");
          setUploadedFiles([]);
          setPendingMapping(null);
          setAnchorZip("");
          setUserDemographics(null);

          // Reset filters to default
          setFilters({
            dateRange: {
              start: null,
              end: null
            },
            confidenceThreshold: 0,
            includeMisc: true,
            mode: "predicted"
          });

          // Reset UI state
          setActiveTab("upload");
          setInputMode("paste");
          toast.success("Session cleared successfully");
        }}>Log Out and Clear Session</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 text-slate-600">
            <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Setup</TabsTrigger>
            <TabsTrigger value="preview" disabled={parsedTransactions.length === 0} className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Preview</TabsTrigger>
            <TabsTrigger value="results" disabled={enrichedTransactions.length === 0} className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Enrichment</TabsTrigger>
            <TabsTrigger value="analytics" disabled={enrichedTransactions.length === 0} className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="insights" disabled={enrichedTransactions.length === 0} className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Insight Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {pendingMapping ? <ColumnMapper detectedColumns={pendingMapping.headers} suggestedMapping={pendingMapping.suggestedMapping} onConfirm={handleMappingConfirm} onCancel={handleMappingCancel} /> : <UploadOrPasteContainer 
              mode={inputMode} 
              onModeChange={(mode) => {
                setInputMode(mode);
              }} 
              onLoadSample={(data, zip, demographics) => {
                setRawInput(data);
                setAnchorZip(zip);
                setUserDemographics(demographics);
                setIsFromSampleData(true);
                setInputMode("paste");
                sessionStorage.setItem("tepilot_user_demographics", JSON.stringify(demographics));
              }}
              activeSelection={activeSelection}
              onActiveSelectionChange={setActiveSelection}
            >
                {inputMode === "paste" ? <PasteInput value={rawInput} onChange={setRawInput} onParse={handleParse} anchorZip={anchorZip} onAnchorZipChange={setAnchorZip} demographics={userDemographics} onDemographicsChange={(d) => { setUserDemographics(d); setIsFromSampleData(false); if (d) sessionStorage.setItem("tepilot_user_demographics", JSON.stringify(d)); else sessionStorage.removeItem("tepilot_user_demographics"); }} isFromSampleData={isFromSampleData} showFormatHint={activeSelection === "paste"} /> : <FileUploader onFileSelect={setUploadedFiles} onParse={files => handleParse(files)} anchorZip={anchorZip} onAnchorZipChange={setAnchorZip} demographics={userDemographics} onDemographicsChange={(d) => { setUserDemographics(d); setIsFromSampleData(false); if (d) sessionStorage.setItem("tepilot_user_demographics", JSON.stringify(d)); else sessionStorage.removeItem("tepilot_user_demographics"); }} isFromSampleData={isFromSampleData} />}
              </UploadOrPasteContainer>}
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <PreviewTable transactions={parsedTransactions} />
            <EnrichActionBar transactionCount={parsedTransactions.length} isProcessing={isProcessing} statusMessage={statusMessage} currentPhase={currentPhase} onEnrich={handleEnrich} />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {currentPhase === "travel" && <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6 flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                  <p className="text-sm font-medium text-yellow-700">
                    {statusMessage || "Analyzing travel patterns..."}
                  </p>
                </CardContent>
              </Card>}
            <div className="flex justify-end">
              <ExportControls transactions={enrichedTransactions} />
            </div>
            <ResultsTable transactions={enrichedTransactions} currentPhase={currentPhase} statusMessage={statusMessage} onCorrection={handleCorrection} />
            
            {currentPhase === "complete" && enrichedTransactions.length > 0 && <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to explore enriched customer profile dashboard?</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      View aggregated spending patterns, travel analysis, and lifestyle breakdowns
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("analytics")} size="lg" className="gap-2">
                    View Enriched Customer Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* View Header */}
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {analyticsView === "single" ? "Customer Lifestyle Dashboard" : "Bank-wide Analytics"}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {analyticsView === "single" ? "Detailed analysis of individual spending patterns and opportunities" : "Aggregated portfolio insights across 70M accounts • 45M users • $180B"}
                  </p>
                </div>
                
              </div>
            </Card>

            {analyticsView === "single" ? <>
                <OverviewMetrics originalTransactions={parsedTransactions} enrichedTransactions={displayTransactions} />
                
                <PillarExplorer transactions={displayTransactions} />
                
                <TravelTimeline transactions={displayTransactions} />
                
                <BeforeAfterTransformation originalTransactions={parsedTransactions} enrichedTransactions={displayTransactions} />
                
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Explore Ventus Insight Tools?</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Access specialized dashboards for Bank Leadership, Rewards Team, or Wealth Management
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("insights")} size="lg" className="gap-2">
                      Go to Insight Tools Selection
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </> : <Accordion type="single" collapsible defaultValue="bankwide">
                <AccordionItem value="bankwide" className="border-slate-200">
                  <AccordionTrigger className="text-lg hover:no-underline text-slate-900">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold">🏦 Bank-wide Analytics Dashboard</span>
                      <span className="text-sm text-slate-500">70M accounts • 45M users • $180B portfolio</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <BankwideView />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {!insightType && <>
                {/* Header */}
                <div className="text-center mb-8 mt-10">
                  <h2 className="text-3xl font-bold mb-2 text-slate-900">One Tech Core, Three Insight Tools</h2>
                  <p className="text-slate-600">
                    Select the view that matches your role to access tailored insights and analytics
                  </p>
                </div>

                {/* Persona Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bank Leadership Card */}
                  <PersonaCard icon={Building2} title="Bank Leadership" valueProposition="Make data-driven decisions across your entire portfolio" description="Discover actionable insights from portfolio-wide spending patterns to optimize product strategy and identify untapped growth opportunities across your customer base." keyFeatures={[
                    "Portfolio-wide behavioral analysis across 70M+ accounts",
                    "12-Pillar interactive spending category explorer with drill-down",
                    "Card product performance matrix comparing spend and frequency",
                    "Demographic breakdown and spending insights by age cohort",
                    "Cross-sell opportunity matrix with projected revenue impact",
                    "Regional spending gap analysis to identify missed opportunities",
                    "Multi-dimension filtering by card product, region, and demographics",
                    "Pillar distribution visualization of aggregate spending allocation",
                    "Regional customer acquisition insights with category-specific marketing recommendations"
                  ]} buttonText="View Bank-wide Dashboard" buttonVariant="ai" onClick={() => setInsightType('bankwide')} />

                  {/* Rewards Team Card */}
                  <PersonaCard icon={TrendingUp} title="Consumer Rewards" valueProposition="Unlock millions in untapped revenue potential" description="Identify where customers are spending outside your ecosystem and generate data-driven strategies to capture more wallet share through targeted engagement." keyFeatures={[
                    "Top 5 spending subcategories analysis with impact ranking",
                    "AI-powered revenue recommendations with projected ROI",
                    "Spending gap detection revealing out-of-ecosystem spend",
                    "Location-based deal targeting for home city and travel destinations",
                    "Travel pattern intelligence across all transaction categories",
                    "Geo-targeted merchant partnership suggestions by category",
                    "Monthly and annual impact estimates for each opportunity",
                    "Transaction reclassification insights with travel context",
                    "Powers next-gen consumer profile dashboards with personalized experiences"
                  ]} buttonText="Rewards Personalization Engine" buttonVariant="ai" onClick={() => {
                if (enrichedTransactions.length === 0) {
                  toast.error("Please enrich transactions first");
                  return;
                }
                // Navigate to the revenue insights view
                setInsightType('revenue');
                setActiveTab('insights');
              }} disabled={enrichedTransactions.length === 0} />

                  {/* Wealth Management Card */}
                  <PersonaCard icon={Users} title="Wealth Management" valueProposition="Transform transactions into relationship insights" description="Transform transaction patterns into relationship intelligence with AI-detected life events and personalized conversation strategies to deepen engagement and grow assets." keyFeatures={[
                    "AI life event detection from transaction patterns (new baby, home, retirement)",
                    "Standout transaction alerts for unusual or significant activity",
                    "Life Event Planner with per-year cost modeling and funding sources",
                    "Tax Planning Analyzer with state-based P&L and optimization tips",
                    "Financial Planning Dashboard: 30-year projections, goals, retirement readiness",
                    "Client Psychology Profiler with actionable communication cues",
                    "Smart conversation chips for Meeting Prep, Financial Standing, and more",
                    "AI-extracted action items from chat and planning tools"
                  ]} buttonText="Access Wealth Management CoPilot" buttonVariant="ai" onClick={() => {
                if (enrichedTransactions.length === 0) {
                  toast.error('Please enrich transactions first to access this tool');
                  return;
                }
                // Save enriched transactions immediately and navigate - analysis happens on target page
                sessionStorage.setItem("tepilot_advisor_context", JSON.stringify({
                  enrichedTransactions: enrichedTransactions,
                  aiInsights: null,
                  needsAnalysis: true
                }));
                navigate('/tepilot/advisor-console');
              }} disabled={enrichedTransactions.length === 0} />
                </div>
              </>}

            {/* Bank-wide Dashboard View */}
            {insightType === 'bankwide' && <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Bank-wide Analytics</h2>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900" onClick={() => setInsightType(null)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Insight Tools Selection
                  </Button>
                </div>
                <BankwideView />
              </div>}

            {insightType === 'revenue' && <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Intelligent Reward Personalization</h2>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900" onClick={() => {
                setActiveTab("insights");
                setInsightType(null);
              }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Insight Tools Selection
                  </Button>
                </div>
                
                {/* AI-Powered Top 3 Pillars Analysis - shows immediately */}
                <TopPillarsAnalysis 
                  transactions={enrichedTransactions} 
                  autoAnalyze={true}
                  customerContext={{
                    homeZip: anchorZip,
                    incomeLevel: userDemographics?.demographics?.incomeLevel,
                    industry: userDemographics?.demographics?.industry,
                    familyStatus: userDemographics?.demographics?.familyStatus,
                  }}
                  onPersonaGenerated={(persona) => {
                    setUserPersona(persona);
                    console.log("[TePilot] Persona received from analysis");
                  }}
                />
            
                
                {/* Reward Personalization Experience - Test deals with individual customers */}
                <CollapsibleCard
                  title="Reward Personalization Experience"
                  description="Preview how bank-defined deals translate into personalized customer messaging"
                  icon={<Sparkles className="h-5 w-5 text-violet-500" />}
                  previewContent={
                    <p className="text-sm text-slate-500">
                      Test how partnership deals would render for this customer based on their transaction history and lifestyle signals.
                    </p>
                  }
                >
                  <DealActivationPreview 
                    enrichedTransactions={enrichedTransactions}
                    personalContext={{
                      demographics: userDemographics?.demographics,
                      persona: userPersona
                    }}
                  />
                </CollapsibleCard>
                
                {/* Subcategory Transactions Modal */}
                <SubcategoryTransactionsModal
                  isOpen={!!selectedSubcategory}
                  onClose={() => setSelectedSubcategory(null)}
                  subcategory={selectedSubcategory?.subcategory || ""}
                  pillar={selectedSubcategory?.pillar || ""}
                  transactions={enrichedTransactions.filter(t => t.subcategory === selectedSubcategory?.subcategory)}
                  onTransactionClick={(t) => setSelectedTransaction(t)}
                />

                {/* Transaction Detail Modal */}
                <TransactionDetailModal
                  isOpen={!!selectedTransaction}
                  onClose={() => setSelectedTransaction(null)}
                  transaction={selectedTransaction}
                />
              </div>}

            {insightType === 'relationship' && <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Wealth Management Relationship Analysis</h2>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900" onClick={() => {
                setActiveTab("insights");
                setInsightType(null);
              }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Insights
                  </Button>
                </div>
                <div className="space-y-0 p-0">
                  <AdvisorConsole aiInsights={lifestyleSignals} isLoadingInsights={isLoadingLifestyleSignals} enrichedTransactions={enrichedTransactions} />
                </div>
              </div>}
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default TePilot;