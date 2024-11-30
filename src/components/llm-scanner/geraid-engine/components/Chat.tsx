import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { useChat } from '../hooks/useChat';
import { ChatProps } from '../types/chat';
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';
import { toast } from 'sonner';

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
  const lastResponseRef = useRef<string | null>(null);

  useEffect(() => {
    const processQuestion = async () => {
      // Don't process if already processing, paused, stopped, or no config
      if (processingRef.current || !config || isLoading || isPaused || isStopped || 
          currentQuestionIndex >= FINGERPRINTING_QUESTIONS.length) {
        return;
      }

      // Check if we've already processed this question
      const currentQuestion = FINGERPRINTING_QUESTIONS[currentQuestionIndex];
      if (lastResponseRef.current === currentQuestion) {
        console.log('Skipping duplicate question:', currentQuestion);
        return;
      }

      try {
        processingRef.current = true;
        console.log('Processing question:', currentQuestionIndex + 1, 'of', FINGERPRINTING_QUESTIONS.length);
        
        const result = await processNextQuestion(config.provider, config.model, scanId);
        console.log('Received result:', result);
        
        if (result && 'success' in result) {
          if (result.success && result.scanId) {
            onScanIdUpdate(result.scanId);
          }
          
          const progress = Math.round((currentQuestionIndex / FINGERPRINTING_QUESTIONS.length) * 100);
          onProgress?.(progress);
          
          if (currentQuestionIndex === FINGERPRINTING_QUESTIONS.length - 1 && fingerprintResults) {
            onComplete(fingerprintResults);
          }

          // Store the last processed question
          lastResponseRef.current = currentQuestion;
        } else {
          throw new Error('Invalid response format from model');
        }
      } catch (error) {
        console.error('Error processing question:', error);
        toast.error('Failed to process question. Please check your API keys and try again.');
      } finally {
        processingRef.current = false;
      }
    };

    // Add a small delay before processing the next question
    const timeoutId = setTimeout(processQuestion, 2000);
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