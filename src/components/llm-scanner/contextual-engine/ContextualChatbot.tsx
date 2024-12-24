import { useState, useEffect } from "react";
import { ModelSelector } from "./ModelSelector";
import { AnalysisPhase } from "./components/AnalysisPhase";
import { useScanLogic } from "./hooks/useScanLogic";
import { ScanPhase } from "./types/phases";

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
    phase,
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
      askNextQuestion(config, isPaused);
    }
  }, [currentStep, isLoading, isStarted, isPaused, pendingQuestion, config, questions.length, askNextQuestion]);

  if (!isStarted) {
    return <ModelSelector onStart={handleStart} />;
  }

  return (
    <AnalysisPhase 
      messages={messages}
      isLoading={isLoading}
      currentStep={currentStep}
      questionsLength={questions.length}
      phase={phase}
      isPaused={isPaused}
      onPauseResume={onPauseResume}
    />
  );
};