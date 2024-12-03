import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);

      try {
        console.log('Starting fingerprint phase with:', { provider, datasetId });
        
        // Start fingerprinting phase
        const { data: fingerprintResult, error: fingerprintError } = await supabase.functions
          .invoke('red-teaming-scan', {
            body: { 
              phase: 'fingerprint',
              provider,
              datasetId
            }
          });

        if (fingerprintError) {
          console.error('Fingerprint error:', fingerprintError);
          throw new Error(fingerprintError.message);
        }
        
        if (isCancelled) return;
        console.log('Fingerprint result:', fingerprintResult);

        // Add fingerprint messages to chat
        setMessages(prev => [
          ...prev,
          { role: 'system', content: 'Starting fingerprint analysis...' },
          ...(fingerprintResult?.messages || [])
        ]);

        // Start dataset augmentation
        console.log('Starting augmentation phase');
        const { data: augmentResult, error: augmentError } = await supabase.functions
          .invoke('red-teaming-scan', {
            body: {
              phase: 'augment',
              provider,
              datasetId,
              fingerprintResults: fingerprintResult?.analysis
            }
          });

        if (augmentError) {
          console.error('Augmentation error:', augmentError);
          throw new Error(augmentError.message);
        }
        
        if (isCancelled) return;
        console.log('Augmentation result:', augmentResult);

        // Add augmentation messages to chat
        setMessages(prev => [
          ...prev,
          { role: 'system', content: 'Starting dataset augmentation...' },
          ...(augmentResult?.messages || [])
        ]);

        // Final testing phase
        console.log('Starting testing phase');
        const { data: testResult, error: testError } = await supabase.functions
          .invoke('red-teaming-scan', {
            body: {
              phase: 'test',
              provider,
              datasetId,
              augmentedPrompts: augmentResult?.prompts
            }
          });

        if (testError) {
          console.error('Testing error:', testError);
          throw new Error(testError.message);
        }
        
        if (isCancelled) return;
        console.log('Testing result:', testResult);

        // Add test messages to chat
        setMessages(prev => [
          ...prev,
          { role: 'system', content: 'Starting final testing phase...' },
          ...(testResult?.messages || []),
          { role: 'system', content: 'Red teaming analysis complete.' }
        ]);

        toast.success('Red teaming analysis completed successfully');

      } catch (error) {
        console.error('Scan error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send request to Edge Function';
        setError(errorMessage);
        setMessages(prev => [
          ...prev,
          { 
            role: 'system', 
            content: `Error: ${errorMessage}`
          }
        ]);
        toast.error(`Scan failed: ${errorMessage}`);
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
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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