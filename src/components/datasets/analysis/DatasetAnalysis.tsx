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
    progress,
    results 
  } = useDatasetAnalysis(
    config,
    fingerprint,
    isPaused,
    lastPausedStep?.phase === 'dataset_analysis' ? lastPausedStep.progress : undefined
  );

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} isPaused={isPaused} />
      <AnalysisChat messages={messages} isLoading={isLoading && !isPaused && !isStopped} />
    </div>
  );
};