import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useContextualScan } from "./contextual-engine/hooks/useContextualScan";
import { ContextualChatMessages } from "./contextual-engine/components/ContextualChatMessages";
import { ModelSelector } from "./contextual-engine/components/ModelSelector";
import { toast } from "sonner";
import { CustomEndpoint } from "./types/CustomEndpoint";
import { DatasetSelector } from "./contextual-engine/components/DatasetSelector";

interface ContextualChatbotProps {
  onFingerprint?: (results: any) => void;
}

export const ContextualChatbot = ({ onFingerprint }: ContextualChatbotProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    inputType: 'manual',
    method: 'POST'
  });
  const [isStarted, setIsStarted] = useState(false);
  const { 
    messages, 
    isLoading, 
    currentStep,
    scanComplete,
    processNextQuestion,
    reset,
    totalQuestions,
    startDatasetAnalysis
  } = useContextualScan();

  const startAnalysis = async () => {
    if (!selectedProvider) {
      toast.error("Please select a provider first");
      return;
    }

    if (!selectedDataset) {
      toast.error("Please select a dataset");
      return;
    }

    if (selectedProvider === 'custom' && !customEndpoint.curlCommand && customEndpoint.inputType === 'curl') {
      toast.error("Please enter a cURL command for the custom endpoint");
      return;
    }

    setIsStarted(true);
    reset();
    const success = await processNextQuestion(selectedProvider, selectedModel, customEndpoint);
    if (!success) {
      setIsStarted(false);
    }
  };

  useEffect(() => {
    const processNextStep = async () => {
      if (isStarted && !isLoading && currentStep < totalQuestions && messages[messages.length - 1]?.role === 'assistant') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Add delay between messages
        await processNextQuestion(selectedProvider, selectedModel, customEndpoint);
      }
    };

    processNextStep();
  }, [currentStep, isLoading, isStarted, selectedProvider, selectedModel, customEndpoint, totalQuestions, messages, processNextQuestion]);

  useEffect(() => {
    if (scanComplete && onFingerprint) {
      const results = {
        capabilities: messages[1]?.content || '',
        boundaries: messages[3]?.content || '',
        training: messages[5]?.content || '',
        languages: messages[7]?.content || '',
        safety: messages[9]?.content || ''
      };
      
      // Start dataset analysis phase
      startDatasetAnalysis(selectedDataset, results, selectedProvider, selectedModel, customEndpoint);
      
      onFingerprint(results);
    }
  }, [scanComplete, messages, onFingerprint, selectedDataset]);

  if (!isStarted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Contextual Model Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a target model and dataset to begin the analysis process. This will help understand the model's capabilities, limitations, and security boundaries.
              </p>
            </div>
            
            <ModelSelector
              provider={selectedProvider}
              model={selectedModel}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
              customEndpoint={customEndpoint}
              onCustomEndpointChange={(endpoint) => setCustomEndpoint(prev => ({ ...prev, ...endpoint }))}
            />

            <DatasetSelector
              value={selectedDataset}
              onValueChange={setSelectedDataset}
            />

            <Button 
              onClick={startAnalysis}
              className="w-full"
              disabled={!selectedProvider || (!selectedModel && selectedProvider !== 'custom') || !selectedDataset}
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
      <ContextualChatMessages messages={messages} isLoading={isLoading} />

      <div className="flex justify-end">
        <Button
          onClick={() => processNextQuestion(selectedProvider, selectedModel, customEndpoint)}
          disabled={isLoading || currentStep >= totalQuestions || messages[messages.length - 1]?.role !== 'assistant'}
        >
          {currentStep >= totalQuestions ? "Analysis Complete" : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};
