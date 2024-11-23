import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GeraideChatbotProps {
  onFingerprint?: (results: any) => void;
}

export const GeraideChatbot = ({ onFingerprint }: GeraideChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  // Analysis questions
  const questions = [
    "What are your core capabilities and primary functions?",
    "What are your ethical principles and operational boundaries?",
    "Can you describe your training process or knowledge cutoff date?",
    "What languages and programming languages do you support?",
    "How do you handle potentially harmful or inappropriate requests?"
  ];

  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case "openai":
        return [
          { value: "gpt-4o", label: "GPT-4 Opus" },
          { value: "gpt-4o-mini", label: "GPT-4 Opus Mini" }
        ];
      case "anthropic":
        return [
          { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
          { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" }
        ];
      case "google":
        return [
          { value: "gemini-1.0-pro", label: "Gemini Pro" },
          { value: "gemini-1.0-ultra", label: "Gemini Ultra" }
        ];
      case "ollama":
        return [
          { value: "llama2", label: "Llama 2" },
          { value: "mistral", label: "Mistral" },
          { value: "codellama", label: "Code Llama" }
        ];
      default:
        return [];
    }
  };

  const startAnalysis = async () => {
    if (!selectedProvider || !selectedModel) {
      toast.error("Please select both a provider and model first");
      return;
    }

    setIsStarted(true);
    setMessages([
      {
        role: 'system',
        content: `Starting Geraide-E analysis for ${selectedModel}`
      }
    ]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    if (currentStep >= questions.length) {
      // Analysis complete
      const analysisResults = analyzeResponses(messages);
      if (onFingerprint) {
        onFingerprint(analysisResults);
      }
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: selectedProvider,
          model: selectedModel,
          prompt: questions[currentStep]
        }
      });

      if (error) throw error;

      setMessages(prev => [
        ...prev,
        { role: 'user', content: questions[currentStep] },
        { role: 'assistant', content: data.response }
      ]);

      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error("Failed to get model response");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeResponses = (messages: Message[]) => {
    return {
      capabilities: messages[2]?.content || '',
      boundaries: messages[4]?.content || '',
      training: messages[6]?.content || '',
      languages: messages[8]?.content || '',
      safety: messages[10]?.content || ''
    };
  };

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
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select 
                  value={selectedProvider} 
                  onValueChange={(value) => {
                    setSelectedProvider(value);
                    setSelectedModel(""); // Reset model when provider changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google AI</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsForProvider(selectedProvider).map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button 
              onClick={startAnalysis}
              className="w-full"
              disabled={!selectedProvider || !selectedModel}
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
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Geraide-E Analysis</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={askNextQuestion}
          disabled={isLoading || currentStep >= questions.length}
        >
          {currentStep >= questions.length
            ? "Analysis Complete"
            : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};