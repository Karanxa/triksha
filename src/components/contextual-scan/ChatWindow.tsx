import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatWindowProps {
  scanId: string;
}

export function ChatWindow({ scanId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch of messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('contextual_scans')
        .select('messages')
        .eq('id', scanId)
        .single();

      if (!error && data?.messages) {
        setMessages(data.messages as Message[]);
      }
    };

    fetchMessages();

    // Subscribe to changes
    const subscription = supabase
      .channel(`scan_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contextual_scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          console.log("Received update:", payload);
          if (payload.new.messages) {
            setMessages(payload.new.messages as Message[]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [scanId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="h-[500px] p-4"
    >
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'assistant'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}