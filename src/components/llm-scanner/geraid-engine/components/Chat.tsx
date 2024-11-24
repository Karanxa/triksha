import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "../types";
import { TypingIndicator } from "../../chat/TypingIndicator";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Json } from "@/integrations/supabase/types/common";
import { supabase } from "@/integrations/supabase/client";

interface ChatProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  } | null;
  onComplete: (results: FingerPrintResult) => void;
  onProgress?: (progress: number) => void;
  isPaused: boolean;
  scanId: string | null;
}

export const Chat = ({ config, onComplete, onProgress, isPaused, scanId }: ChatProps) => {
  const { state, processNextQuestion } = useChat();
  const { messages, isLoading, currentQuestionIndex, fingerprintResults } = state;

  useEffect(() => {
    const processQuestion = async () => {
      if (!config || isLoading || isPaused || !scanId) return;
      
      const success = await processNextQuestion(config.provider, config.model);
      
      // Calculate and report progress
      const totalQuestions = 5; // Total number of fingerprinting questions
      const progress = Math.round((currentQuestionIndex / totalQuestions) * 100);
      onProgress?.(progress);

      // Update scan status in database
      await supabase
        .from('llm_scans')
        .update({
          results: {
            progress,
            messages: getJsonSafeMessages(messages),
            currentQuestionIndex,
            fingerprint: fingerprintResults
          }
        })
        .eq('id', scanId);
      
      if (!success && fingerprintResults) {
        onComplete(fingerprintResults);
      }
    };

    // Start with a small delay to allow UI to render
    const timer = setTimeout(processQuestion, 500);
    return () => clearTimeout(timer);
  }, [config, currentQuestionIndex, isLoading, isPaused, scanId]);

  const getJsonSafeMessages = (msgs: Message[]): Json => {
    return msgs.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  };

  if (!config) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Model Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading && !isPaused} />
      </CardContent>
    </Card>
  );
};
