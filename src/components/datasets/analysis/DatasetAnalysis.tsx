import { AnalysisProgress } from "./AnalysisProgress";
import { AnalysisChat } from "./AnalysisChat";
import { PromptList } from "./PromptList";
import { useDatasetAnalysis } from "./useDatasetAnalysis";
import { DatasetAnalysisProps } from "./types";

export const DatasetAnalysis = ({ 
  config, 
  fingerprint, 
  isPaused,
  isStopped,
  lastPausedStep 
}: DatasetAnalysisProps) => {
  const { 
    messages, 
    isLoading, 
    originalPrompts, 
    progress,
    phase 
  } = useDatasetAnalysis({
    config,
    fingerprint,
    isPaused,
    isStopped,
    lastPausedStep
  });

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={phase} isPaused={isPaused} />
      <PromptList prompts={originalPrompts} />
      <AnalysisChat messages={messages} isLoading={isLoading && !isPaused && !isStopped} />
    </div>
  );
};