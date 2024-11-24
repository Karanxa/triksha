import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGeraideScan } from "./geraid-engine/hooks/useGeraideScan";
import { GeraideChatMessages } from "./geraid-engine/components/GeraideChatMessages";
import { toast } from "sonner";
import { CustomEndpoint } from "./types/CustomEndpoint";
import { GeraidConfigForm } from "./geraid-engine/components/GeraidConfigForm";

interface GeraideChatbotProps {
  onFingerprint?: (results: any) => void;
}

export const GeraideChatbot = ({ onFingerprint }: GeraideChatbotProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>();
  const [isStarted, setIsStarted] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    currentStep,
    scanComplete,
    processNextQuestion,
    reset,
    totalQuestions,
    isPaused,
    setIsPaused
  } = useGeraideScan();

  const startAnalysis = async () => {
    if ((!selectedProvider || !selectedModel) && selectedProvider !== "custom") {
      toast.error("Please select both a provider and model first");
      return;
    }

    if (selectedProvider === "custom" && !customEndpoint?.url) {
      toast.error("Please configure the custom endpoint first");
      return;
    }

    if (!selectedDataset) {
      toast.error("Please select a dataset first");
      return;
    }

    setIsStarted(true);
    reset();
    await processNextQuestion({
      provider: selectedProvider,
      model: selectedModel,
      datasetId: selectedDataset,
      customEndpoint
    });
  };

  useEffect(() => {
    if (isStarted && !isLoading && currentStep < totalQuestions && !isPaused) {
      const timer = setTimeout(() => {
        processNextQuestion({
          provider: selectedProvider,
          model: selectedModel,
          datasetId: selectedDataset,
          customEndpoint
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isLoading, isStarted, selectedProvider, selectedModel, selectedDataset, customEndpoint, totalQuestions, isPaused]);

  useEffect(() => {
    if (scanComplete && onFingerprint) {
      const results = {
        capabilities: messages[2]?.content || '',
        boundaries: messages[4]?.content || '',
        training: messages[6]?.content || '',
        languages: messages[8]?.content || '',
        safety: messages[10]?.content || ''
      };
      onFingerprint(results);
    }
  }, [scanComplete, messages, onFingerprint]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Analysis resumed" : "Analysis paused");
  };

  if (!isStarted) {
    return (
      <GeraidConfigForm
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        selectedDataset={selectedDataset}
        customEndpoint={customEndpoint}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        onDatasetChange={setSelectedDataset}
        onCustomEndpointChange={setCustomEndpoint}
        onStart={startAnalysis}
      />
    );
  }

  return (
    <div className="space-y-4">
      <GeraideChatMessages messages={messages} isLoading={isLoading} />

      <div className="flex justify-end gap-2">
        <Button
          onClick={handlePauseResume}
          variant="outline"
        >
          {isPaused ? "Resume Analysis" : "Pause Analysis"}
        </Button>
        <Button
          onClick={() => processNextQuestion({
            provider: selectedProvider,
            model: selectedModel,
            datasetId: selectedDataset,
            customEndpoint
          })}
          disabled={isLoading || currentStep >= totalQuestions || isPaused}
        >
          {currentStep >= totalQuestions ? "Analysis Complete" : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};