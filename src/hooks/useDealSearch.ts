import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Deal } from "@/components/dashboard/DealCard";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useDealSearch = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchDeals = async (query: string) => {
    setIsLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: query }]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("search-deals", {
        body: { query, userId: user.id },
      });

      if (error) throw error;

      if (data?.deals && Array.isArray(data.deals)) {
        // Add new deals to the top
        setDeals(prev => [...data.deals, ...prev]);
        
        // Add AI response message
        const dealCount = data.deals.length;
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `I found ${dealCount} great ${dealCount === 1 ? 'deal' : 'deals'} for you! Check them out on the right. ${data.message || ''}`,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't find any deals matching your request. Try adjusting your search criteria!",
          },
        ]);
      }
    } catch (error) {
      console.error("Error searching deals:", error);
      toast({
        title: "Search failed",
        description: "Unable to search for deals. Please try again.",
        variant: "destructive",
      });
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while searching. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    deals,
    isLoading,
    searchDeals,
  };
};
