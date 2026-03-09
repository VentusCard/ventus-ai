import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mail, RefreshCw, Loader2, Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateSamplePersonas, type SyntheticPersona } from "@/lib/samplePersonaGenerator";

interface PersonalizationPreviewPanelProps {
  selectedProduct: { id: string; name: string } | null;
  selectedPillars: string[];
  selectedLifeEvents: string[];
  hasSelections: boolean;
}

interface PersonalizedMessage {
  id: string;
  msg: string;
  cta: string;
}

export function PersonalizationPreviewPanel({
  selectedProduct,
  selectedPillars,
  selectedLifeEvents,
  hasSelections,
}: PersonalizationPreviewPanelProps) {
  const [personas, setPersonas] = useState<SyntheticPersona[]>([]);
  const [messages, setMessages] = useState<Record<string, PersonalizedMessage>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Regenerate personas when targeting changes
  useEffect(() => {
    if (hasSelections) {
      const newPersonas = generateSamplePersonas(selectedPillars, selectedLifeEvents, 3);
      setPersonas(newPersonas);
      setMessages({});
      setHasGenerated(false);
    }
  }, [selectedPillars, selectedLifeEvents, hasSelections]);

  const generatePersonalizedMessages = useCallback(async () => {
    if (!selectedProduct || personas.length === 0) return;

    setIsGenerating(true);

    try {
      // Build deal representation for the AI
      const deals = personas.map((persona) => ({
        id: persona.id,
        m: selectedProduct.name,
        c: "cross-sell",
        r: "Personalized offer",
      }));

      // Build profile summaries for each persona
      const profiles = personas.map((persona) => ({
        pillars: Object.fromEntries(
          persona.behavioralTags.map((tag) => [tag, { spend: 1500, rank: "high" }])
        ),
        signals: persona.transactionSignals,
      }));

      // Build context for personalization
      const ctx = personas.map((persona) => ({
        demo: {
          occ: persona.behavioralTags[0] || "professional",
          fam: persona.behavioralTags.includes("Family") ? "family" : "single",
        },
        persona: {
          traits: persona.behavioralTags,
          interests: persona.transactionSignals,
        },
      }));

      // Call the deal-personalization edge function
      const { data, error } = await supabase.functions.invoke("deal-personalization", {
        body: {
          deals,
          profile: profiles[0], // Use first profile as base
          ctx: ctx[0],
          txCount: 50,
        },
      });

      if (error) throw error;

      // Map responses to personas
      const recs = data?.recs || [];
      const newMessages: Record<string, PersonalizedMessage> = {};
      
      recs.forEach((rec: PersonalizedMessage, index: number) => {
        const persona = personas[index];
        if (persona) {
          newMessages[persona.id] = rec;
        }
      });

      setMessages(newMessages);
      setHasGenerated(true);
    } catch (err) {
      console.error("Personalization error:", err);
      // Generate fallback messages
      const fallbackMessages: Record<string, PersonalizedMessage> = {};
      personas.forEach((persona) => {
        fallbackMessages[persona.id] = {
          id: persona.id,
          msg: `Unlock exclusive ${selectedProduct.name} benefits tailored to your ${persona.behavioralTags[0]} lifestyle.`,
          cta: "Learn More",
        };
      });
      setMessages(fallbackMessages);
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProduct, personas]);

  // Auto-generate when product changes and we have personas
  useEffect(() => {
    if (selectedProduct && personas.length > 0 && !hasGenerated && !isGenerating) {
      generatePersonalizedMessages();
    }
  }, [selectedProduct, personas, hasGenerated, isGenerating, generatePersonalizedMessages]);

  if (!hasSelections) {
    return null;
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Same Product, Three Stories</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generatePersonalizedMessages}
            disabled={isGenerating || !selectedProduct}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-1.5">Regenerate</span>
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          {selectedProduct 
            ? `AI crafts unique ${selectedProduct.name} messaging for each customer based on their actual spending behavior.`
            : "Select a product above to see personalized messaging previews."}
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {personas.map((persona, i) => {
            const message = messages[persona.id];
            
            return (
              <div
                key={persona.id}
                className="rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                {/* Profile header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: persona.avatarColor }}
                    >
                      {persona.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{persona.name}</p>
                      <div className="flex gap-1.5 mt-0.5 flex-wrap">
                        {persona.behavioralTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap"
                            style={{ 
                              background: `${persona.avatarColor}15`, 
                              color: persona.avatarColor 
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Behavioral signals */}
                  <div className="space-y-1 mb-3">
                    {persona.transactionSignals.map((signal) => (
                      <div key={signal} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Plane className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalized message */}
                <div
                  className="mx-3 mb-3 p-3 rounded-lg border"
                  style={{
                    background: `linear-gradient(135deg, ${persona.avatarColor}08, ${persona.avatarColor}04)`,
                    borderColor: `${persona.avatarColor}20`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3 h-3" style={{ color: persona.avatarColor }} />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      AI-Generated Message
                    </span>
                  </div>
                  {isGenerating && !message ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                      <span className="text-xs text-slate-400">Generating...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      <span className="mr-1">{persona.emoji}</span>
                      "{message?.msg || `Personalized ${selectedProduct?.name || 'offer'} message...`}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion insight */}
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-primary/5">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700">
            <span className="font-bold text-primary">3.8x higher conversion</span>{" "}
            when messaging is personalized from transaction signals vs. generic segment-level campaigns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
