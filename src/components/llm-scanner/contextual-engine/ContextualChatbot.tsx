import { useState, useEffect } from "react";
import { ModelSelector } from "./ModelSelector";
import { AnalysisPhase } from "./components/AnalysisPhase";
import { useScanLogic } from "./hooks/useScanLogic";

interface ContextualChatbotProps {
  onFingerprint?: (results: any) => void;
  isPaused?: boolean;
  onPauseResume?: () => void;
}

export const ContextualChatbot = ({ 
  onFingerprint, 
  isPaused = false,
  onPauseResume = () => {}
}: ContextualChatbotProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const {
    messages,
    isLoading,
    currentStep,
    pendingQuestion,
    questions,
    startScan,
    askNextQuestion
  } = useScanLogic(onFingerprint);

  const handleStart = async (analysisConfig: any) => {
    setIsStarted(true);
    setConfig(analysisConfig);
    await startScan(analysisConfig);
  };

  useEffect(() => {
    if (isStarted && !isLoading && !isPaused && !pendingQuestion && currentStep < questions.length) {
      const timer = setTimeout(() => askNextQuestion(config, isPaused), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isLoading, isStarted, isPaused, pendingQuestion]);

  if (!isStarted) {
    return <ModelSelector onStart={handleStart} />;
  }

  return (
    <AnalysisPhase 
      messages={messages}
      isLoading={isLoading}
      currentStep={currentStep}
      questionsLength={questions.length}
      isPaused={isPaused}
      onPauseResume={onPauseResume}
    />
  );
};