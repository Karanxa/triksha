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
    const processQuestion = async () => {
      if (!config || isLoading || isPaused || isStopped) return;

      try {
        const result = await processNextQuestion(config.provider, config.model, scanId);
        
        if (result && 'success' in result) {
          if (result.success && result.scanId) {
            onScanIdUpdate(result.scanId);
          }
          
          const totalQuestions = 5;
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