import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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

  useEffect(() => {
    // Initial fetch of messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('contextual_scans')
        .select('messages')
        .eq('id', scanId)
        .single();

      if (!error && data?.messages) {
        // Type assertion since we know the structure of our messages
        const parsedMessages = data.messages as unknown as Message[];
        setMessages(parsedMessages);
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
          if (payload.new.messages) {
            // Type assertion for the realtime updates
            const newMessages = payload.new.messages as unknown as Message[];
            setMessages(newMessages);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [scanId]);

  return (
    <div className="p-4 space-y-4">
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
  );
}