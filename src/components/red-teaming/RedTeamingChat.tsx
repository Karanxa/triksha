import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RedTeamingChatProps {
  isScanning: boolean;
  isPaused: boolean;
  provider: string;
  datasetId: string | null;
}

export const RedTeamingChat = ({
  isScanning,
  isPaused,
  provider,
  datasetId
}: RedTeamingChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let isCancelled = false;

    const runScan = async () => {
      if (!isScanning || isPaused || !provider || !datasetId) return;
      setIsProcessing(true);

      try {
        // Start fingerprinting phase
        const { data: fingerprintResult, error: fingerprintError } = await supabase.functions
          .invoke('red-teaming-scan', {
            body: { 
              phase: 'fingerprint',
              provider,
              datasetId
            }
          });

        if (fingerprintError) throw fingerprintError;
        if (isCancelled) return;

        // Add fingerprint messages to chat
        setMessages(prev => [
          ...prev,
          { role: 'system', content: 'Starting fingerprint analysis...' },
          ...fingerprintResult.messages
        ]);

        // Start dataset augmentation
        const { data: augmentResult, error: augmentError } = await supabase.functions
          .invoke('red-teaming-scan', {
            body: {
              phase: 'augment',
              provider,
              datasetId,
              fingerprintResults: fingerprintResult.analysis
            }
          });

        if (augmentError) throw augmentError;
        if (isCancelled) return;

        // Add augmentation messages to chat
        setMessages(prev => [
          ...prev,
          { role: 'system', content: 'Starting dataset augmentation...' },
          ...augmentResult.messages
        ]);

        // Final testing phase
        const { data: testResult, error: testError } = await supabase.functions
          .invoke('red-teaming-scan', {
            body: {
              phase: 'test',
              provider,
              datasetId,
              augmentedPrompts: augmentResult.prompts
            }
          });

        if (testError) throw testError;
        if (isCancelled) return;

        // Add test messages to chat
        setMessages(prev => [
          ...prev,
          { role: 'system', content: 'Starting final testing phase...' },
          ...testResult.messages,
          { role: 'system', content: 'Red teaming analysis complete.' }
        ]);

      } catch (error) {
        console.error('Scan error:', error);
        setMessages(prev => [
          ...prev,
          { 
            role: 'system', 
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
          }
        ]);
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    };

    runScan();

    return () => {
      isCancelled = true;
    };
  }, [isScanning, isPaused, provider, datasetId]);

  return (
    <div className="border rounded-lg p-4 h-[600px] flex flex-col">
      <ScrollArea ref={scrollRef} className="flex-grow">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === 'system'
                  ? 'bg-muted text-muted-foreground'
                  : message.role === 'assistant'
                  ? 'bg-primary/10'
                  : 'bg-accent'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};