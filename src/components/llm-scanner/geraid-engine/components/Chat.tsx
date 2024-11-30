import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { useChat } from '../hooks/useChat';
import { ChatProps } from '../types/chat';
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';

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
  const processingRef = useRef(false);

  useEffect(() => {
    const processQuestion = async () => {
      // Don't process if already processing, paused, stopped, or no config
      if (processingRef.current || !config || isLoading || isPaused || isStopped || 
          currentQuestionIndex >= FINGERPRINTING_QUESTIONS.length) {
        return;
      }

      try {
        processingRef.current = true;
        console.log('Processing question:', currentQuestionIndex + 1, 'of', FINGERPRINTING_QUESTIONS.length);
        
        const result = await processNextQuestion(config.provider, config.model, scanId);
        
        if (result && 'success' in result) {
          if (result.success && result.scanId) {
            onScanIdUpdate(result.scanId);
          }
          
          const progress = Math.round((currentQuestionIndex / FINGERPRINTING_QUESTIONS.length) * 100);
          onProgress?.(progress);
          
          if (currentQuestionIndex === FINGERPRINTING_QUESTIONS.length - 1 && fingerprintResults) {
            onComplete(fingerprintResults);
          }
        }
      } catch (error) {
        console.error('Error processing question:', error);
      } finally {
        processingRef.current = false;
      }
    };

    // Add a small delay before processing the next question
    const timeoutId = setTimeout(processQuestion, 1000);
    return () => clearTimeout(timeoutId);
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