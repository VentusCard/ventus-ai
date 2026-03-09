import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mail, RefreshCw, Loader2, Plane, CreditCard } from "lucide-react";
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

const TIER_COLORS: Record<string, string> = {
  "Mass Market": "hsl(var(--primary))",
  "Affluent": "#f59e0b",
  "HNW": "#8b5cf6",
};

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

  // Check if personas have per-persona products (tier mode)
  const hasTierProducts = personas.some(p => p.recommendedProduct);

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
    if (personas.length === 0) return;
    // Need either a global product or per-persona products
    if (!selectedProduct && !hasTierProducts) return;

    setIsGenerating(true);

    try {
      const results = await Promise.all(
        personas.map(async (persona) => {
          const productForPersona = persona.recommendedProduct || selectedProduct!;

          const deal = {
            id: persona.id,
            m: productForPersona.name,
            c: "cross-sell",
            r: "Personalized offer",
          };

          const profile = {
            pillars: Object.fromEntries(
              persona.behavioralTags.map((tag) => [tag, { spend: 1500, rank: "high" }])
            ),
            signals: persona.transactionSignals,
          };

          const ctx = {
            demo: {
              occ: persona.behavioralTags[0] || "professional",
              fam: persona.behavioralTags.some(t =>
                ["Family", "New Parent", "Growing Family", "Family Expansion", "Parent", "Family Focused", "Caregiver"].includes(t)
              ) ? "family" : "single",
            },
            persona: {
              traits: persona.behavioralTags,
              interests: persona.transactionSignals,
            },
          };

          const { data, error } = await supabase.functions.invoke("deal-personalization", {
            body: {
              deals: [deal],
              profile,
              ctx,
              txCount: 50,
            },
          });

          if (error) throw error;
          const rec = data?.recs?.[0];
          return { personaId: persona.id, rec };
        })
      );

      const newMessages: Record<string, PersonalizedMessage> = {};
      results.forEach(({ personaId, rec }) => {
        if (rec) {
          newMessages[personaId] = rec;
        }
      });

      setMessages(newMessages);
      setHasGenerated(true);
    } catch (err) {
      console.error("Personalization error:", err);
      const fallbackMessages: Record<string, PersonalizedMessage> = {};
      personas.forEach((persona) => {
        const pName = persona.recommendedProduct?.name || selectedProduct?.name || "offer";
        fallbackMessages[persona.id] = {
          id: persona.id,
          msg: `Unlock exclusive ${pName} benefits tailored to your ${persona.behavioralTags[0]} lifestyle.`,
          cta: "Learn More",
        };
      });
      setMessages(fallbackMessages);
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProduct, personas, hasTierProducts]);

  // Auto-generate when product changes and we have personas
  useEffect(() => {
    const canGenerate = selectedProduct || hasTierProducts;
    if (canGenerate && personas.length > 0 && !hasGenerated && !isGenerating) {
      generatePersonalizedMessages();
    }
  }, [selectedProduct, personas, hasGenerated, isGenerating, generatePersonalizedMessages, hasTierProducts]);

  if (!hasSelections) {
    return null;
  }

  const headerProduct = hasTierProducts
    ? "tier-matched products"
    : selectedProduct?.name || "product";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              {hasTierProducts ? "Same Event, Three Products" : "Same Product, Three Stories"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generatePersonalizedMessages}
            disabled={isGenerating || (!selectedProduct && !hasTierProducts)}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-1.5">Regenerate</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {hasTierProducts
            ? "AI matches each customer to the right product based on their wealth tier, then personalizes the message from transaction signals."
            : `AI crafts unique ${headerProduct} messaging for each customer based on their actual spending behavior.`}
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {personas.map((persona) => {
            const message = messages[persona.id];
            const tierColor = persona.tier ? TIER_COLORS[persona.tier] : undefined;
            const personaProduct = persona.recommendedProduct || selectedProduct;

            return (
              <div
                key={persona.id}
                className="rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                {/* Tier + Product badge */}
                {persona.tier && persona.recommendedProduct && (
                  <div
                    className="px-4 py-2 flex items-center justify-between text-xs font-semibold"
                    style={{
                      background: `${tierColor}10`,
                      borderBottom: `1px solid ${tierColor}25`,
                      color: tierColor,
                    }}
                  >
                    <span>{persona.tier} · {persona.behavioralTags[1]}</span>
                    <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0" style={{ borderColor: `${tierColor}40`, color: tierColor }}>
                      <CreditCard className="w-2.5 h-2.5" />
                      {persona.recommendedProduct.name}
                    </Badge>
                  </div>
                )}

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
                      <p className="text-sm font-bold text-foreground truncate">{persona.name}</p>
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
                      <div key={signal} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Plane className="w-3 h-3 text-muted-foreground/60 shrink-0" />
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
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      AI-Generated Message
                    </span>
                  </div>
                  {isGenerating && !message ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Generating...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-foreground leading-relaxed font-medium">
                      <span className="mr-1">{persona.emoji}</span>
                      "{message?.msg || `Personalized ${personaProduct?.name || 'offer'} message...`}"
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
          <p className="text-sm text-foreground/80">
            <span className="font-bold text-primary">3.8x higher conversion</span>{" "}
            {hasTierProducts
              ? "when both product selection and messaging are personalized from transaction signals vs. one-size-fits-all campaigns."
              : "when messaging is personalized from transaction signals vs. generic segment-level campaigns."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
