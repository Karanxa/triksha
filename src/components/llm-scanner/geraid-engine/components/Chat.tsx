import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { useChat } from '../hooks/useChat';
import { ChatProps } from '../types/chat';

export const Chat = ({ 
  config, 
  onComplete, 
  onProgress,
  isPaused,
  isStopped,
  scanId,
  onScanIdUpdate
}: ChatProps) => {
  const { state, processNextQuestion } = useChat();
  const { messages, isLoading, currentQuestionIndex, fingerprintResults } = state;

  useEffect(() => {
    let isMounted = true;

    const processQuestion = async () => {
      // Only process if not loading, not paused, not stopped, and we have config
      if (!config || isLoading || isPaused || isStopped) return;

      try {
        const result = await processNextQuestion(config.provider, config.model, scanId);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        if (result && 'success' in result) {
          if (result.success && result.scanId) {
            onScanIdUpdate(result.scanId);
          }
          
          // Calculate and report progress
          const totalQuestions = 5; // Total number of fingerprinting questions
          const progress = Math.round((currentQuestionIndex / totalQuestions) * 100);
          onProgress?.(progress);
          
          if (!result.success && fingerprintResults) {
            onComplete(fingerprintResults);
          }
        }
      } catch (error) {
        console.error('Error processing question:', error);
      }
    };

    processQuestion();

    return () => {
      isMounted = false;
    };
  }, [config, currentQuestionIndex, isLoading, isPaused, isStopped, scanId]);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Model Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};