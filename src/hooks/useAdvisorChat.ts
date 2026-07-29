import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdvisorContext } from "@/lib/advisorContextBuilder";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseAdvisorChatProps {
  advisorContext?: Partial<AdvisorContext> & Record<string, unknown>;
  functionName?: string;
}

export const useAdvisorChat = ({ advisorContext, functionName = "advisor-chat" }: UseAdvisorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      console.log(`Sending message to ${functionName}...`);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          message: content,
          conversationHistory,
          context: advisorContext,
        },
      });

      if (error) {
        console.error("Error calling advisor-chat:", error);
        throw error;
      }

      if (!data?.message) {
        throw new Error("No response from AI");
      }

      // Add AI response
      const aiMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
      
      toast.error(
        error instanceof Error ? error.message : "Failed to send message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
