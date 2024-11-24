import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGeraideScan } from "./geraid-engine/hooks/useGeraideScan";
import { GeraideChatMessages } from "./geraid-engine/components/GeraideChatMessages";
import { ModelSelector } from "./geraid-engine/ModelSelector";
import { toast } from "sonner";
import { CustomEndpoint } from "./types/CustomEndpoint";

interface GeraideChatbotProps {
  onFingerprint?: (results: any) => void;
}

export const GeraideChatbot = ({ onFingerprint }: GeraideChatbotProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>();
  const [isStarted, setIsStarted] = useState(false);
  const { 
    messages, 
    isLoading, 
    currentStep,
    scanComplete,
    processNextQuestion,
    reset,
    totalQuestions
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

    setIsStarted(true);
    reset();
    await processNextQuestion(selectedProvider, selectedModel, customEndpoint);
  };

  useEffect(() => {
    if (isStarted && !isLoading && currentStep < totalQuestions) {
      const timer = setTimeout(() => {
        processNextQuestion(selectedProvider, selectedModel, customEndpoint);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isLoading, isStarted, selectedProvider, selectedModel, customEndpoint, totalQuestions]);

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

  if (!isStarted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Geraide-E Model Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a target model to begin the analysis process. This will help understand the model's capabilities, limitations, and security boundaries.
              </p>
            </div>
            
            <ModelSelector
              provider={selectedProvider}
              model={selectedModel}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
              customEndpoint={customEndpoint}
              onCustomEndpointChange={setCustomEndpoint}
            />

            <Button 
              onClick={startAnalysis}
              className="w-full"
              disabled={!selectedProvider || (!selectedModel && selectedProvider !== "custom")}
            >
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <GeraideChatMessages messages={messages} isLoading={isLoading} />

      <div className="flex justify-end">
        <Button
          onClick={() => processNextQuestion(selectedProvider, selectedModel, customEndpoint)}
          disabled={isLoading || currentStep >= totalQuestions}
        >
          {currentStep >= totalQuestions ? "Analysis Complete" : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};