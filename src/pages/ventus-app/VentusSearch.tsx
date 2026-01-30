import { useState, useRef, useEffect } from 'react';
import { Loader2, Search, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VentusSidebar } from '@/components/ventus-app/VentusSidebar';
import { ChatProductCard } from '@/components/ventus-app/ChatProductCard';
import { chatbotApi, chatApi, VentusProduct, ChatMessage } from '@/lib/ventusApi';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface DisplayMessage {
  id?: string;
  sender: 'user' | 'ventus';
  type: 'text' | 'results';
  content: string;
  products?: VentusProduct[];
  item?: string;
  query?: string;
  timestamp: Date;
}

const EXAMPLE_SEARCHES = [
  'Wireless headphones',
  'Running shoes',
  'Gym apparel',
  'Golf clubs on sale',
];

// Date formatting helpers
const formatDateSeparator = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const shouldShowDateSeparator = (currentMsg: DisplayMessage, previousMsg?: DisplayMessage): boolean => {
  if (!previousMsg) return true;
  const currentDate = new Date(currentMsg.timestamp).toDateString();
  const previousDate = new Date(previousMsg.timestamp).toDateString();
  return currentDate !== previousDate;
};

export default function VentusSearch() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem('ventus_token');
        if (!token) {
          setIsLoadingHistory(false);
          return;
        }

        const data = await chatApi.getHistory();
        const formattedMessages: DisplayMessage[] = (data.messages || []).map((msg: ChatMessage) => ({
          id: msg.id,
          sender: msg.sender,
          type: msg.message_type,
          content: msg.content,
          products: msg.products,
          item: msg.item,
          query: msg.query,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  // Focus input and scroll to bottom after loading history
  useEffect(() => {
    if (!isLoadingHistory) {
      inputRef.current?.focus();
      // Scroll to bottom after history loads
      setTimeout(scrollToBottom, 150);
    }
  }, [isLoadingHistory]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Build conversation context from last 6 messages
  const buildContext = () => {
    return messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.sender === 'user' 
        ? m.content 
        : (m.type === 'results' ? `Found ${m.products?.length || 0} products for ${m.item || 'your search'}` : m.content),
    }));
  };

  // Save message to backend
  const saveMessage = async (message: DisplayMessage) => {
    try {
      await chatApi.saveMessage({
        sender: message.sender,
        messageType: message.type,
        content: message.content,
        products: message.products || null,
        item: message.item || null,
        query: message.query || null,
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: DisplayMessage = { 
      sender: 'user', 
      type: 'text',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message
    saveMessage(userMessage);

    try {
      const history = buildContext();
      const response = await chatbotApi.search(query, history);

      const isSearchResult = response.type === 'search' && response.products?.length > 0;
      
      const assistantMessage: DisplayMessage = {
        sender: 'ventus',
        type: isSearchResult ? 'results' : 'text',
        content: response.message,
        products: isSearchResult ? response.products : undefined,
        item: response.item,
        query: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message
      saveMessage(assistantMessage);
    } catch (error) {
      toast.error('Search failed. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleExampleClick = (example: string) => {
    sendMessage(example);
  };

  return (
    <VentusSidebar>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ventus AI</h1>
            <p className="text-sm text-muted-foreground mt-1">Find deals across all merchants</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="max-w-3xl mx-auto px-6 py-6">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0064E0]/20 to-[#0064E0]/10 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-[#0064E0]" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Find Your Perfect Deal
                  </h2>
                  <p className="text-muted-foreground text-sm text-center mb-8 max-w-sm">
                    Search for products and I'll find the best prices for you
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {EXAMPLE_SEARCHES.map((example) => (
                      <button
                        key={example}
                        onClick={() => handleExampleClick(example)}
                        className="px-4 py-2 bg-card border border-border rounded-full hover:border-[#0064E0]/50 hover:bg-[#0064E0]/5 transition-all text-sm text-foreground"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const previousMessage = index > 0 ? messages[index - 1] : undefined;
                    const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
                    const isUser = message.sender === 'user';

                    return (
                      <div key={message.id || index}>
                        {/* Date separator */}
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-6">
                            <div className="bg-muted px-3 py-1 rounded-full">
                              <span className="text-xs text-muted-foreground font-medium">
                                {formatDateSeparator(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Message bubble or plain text for product results */}
                        {isUser ? (
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 bg-[#0064E0]">
                              <p className="text-base whitespace-pre-wrap text-white">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ) : message.products && message.products.length > 0 ? (
                          <>
                            <p className="text-base text-muted-foreground mb-3">
                              {message.content}
                            </p>
                            <div className="space-y-2">
                              {message.products.map((product, pIndex) => (
                                <ChatProductCard key={pIndex} product={product} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-muted">
                              <div className="text-base text-white [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_strong]:font-bold [&_em]:italic [&_code]:bg-white/20 [&_code]:px-1 [&_code]:rounded">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0064E0]" />
                        <span className="text-sm text-muted-foreground">Searching for deals...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me to find deals..."
                  disabled={isLoading}
                  className="pl-9 h-11 text-sm rounded-full border-border text-white placeholder:text-muted-foreground"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-11 w-11 rounded-full bg-[#0064E0] hover:bg-[#0064E0]/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </VentusSidebar>
  );
}
