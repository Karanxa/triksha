import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ModelFingerprintMessage } from "@/integrations/supabase/types/tables/model-fingerprint";

interface ModelFingerprintChatProps {
  sessionId: string;
}

export function ModelFingerprintChat({ sessionId }: ModelFingerprintChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['model-fingerprint-messages', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_fingerprint_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ModelFingerprintMessage[];
    },
    refetchInterval: 1000
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]" ref={scrollRef}>
      <div className="space-y-4 p-4">
        {messages?.map((message) => (
          <Card
            key={message.id}
            className={`p-4 ${
              message.role === 'assistant' 
                ? 'bg-primary/10' 
                : message.role === 'system'
                ? 'bg-muted/50'
                : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {message.role}:
              </span>
              <div className="flex-1">
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.metadata && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {JSON.stringify(message.metadata, null, 2)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}