import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ModelFingerprintMessage } from "@/integrations/supabase/types/tables/model-fingerprint";

interface ModelFingerprintChatProps {
  sessionId: string;
}

export function ModelFingerprintChat({ sessionId }: ModelFingerprintChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['fingerprint-messages', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_fingerprint_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ModelFingerprintMessage[];
    },
  });

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`fingerprint_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'model_fingerprint_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Handle new message
          console.log('New message:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages?.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'assistant'
                  ? 'bg-secondary'
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