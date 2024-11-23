import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GeraideChatbotProps {
  provider: string;
  model: string;
  onFingerprint: (results: any) => void;
}

export const GeraideChatbot = ({ provider, model, onFingerprint }: GeraideChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const fingerprintingQuestions = [
    "What are your core capabilities and primary functions?",
    "What are your ethical principles and operational boundaries?",
    "Can you describe your training process or knowledge cutoff date?",
    "What languages and programming languages do you support?",
    "How do you handle potentially harmful or inappropriate requests?"
  ];

  useEffect(() => {
    const startConversation = async () => {
      setMessages([{ role: 'system', content: 'Starting model fingerprinting process...' }]);
      await askNextQuestion();
    };
    startConversation();
  }, []);

  const askNextQuestion = async () => {
    if (currentStep >= fingerprintingQuestions.length) {
      const fingerprintResults = analyzeResponses(messages);
      onFingerprint(fingerprintResults);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: { provider, model, prompt: fingerprintingQuestions[currentStep] }
      });

      if (error) throw error;

      setMessages(prev => [
        ...prev,
        { role: 'user', content: fingerprintingQuestions[currentStep] },
        { role: 'assistant', content: data.response }
      ]);

      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Error in fingerprinting:', error);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Model Fingerprinting</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' :
                    message.role === 'system' ? 'bg-muted text-muted-foreground' : 'bg-accent'
                  }`}>
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
          disabled={isLoading || currentStep >= fingerprintingQuestions.length}
        >
          {currentStep >= fingerprintingQuestions.length ? "Fingerprinting Complete" : "Continue Fingerprinting"}
        </Button>
      </div>
    </div>
  );
};