import { useEffect, useState } from "react";
import { Message } from "../types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DatasetChatProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  fingerprint: any;
  isPaused: boolean;
  isStopped: boolean;
  onProgress: (progress: number) => void;
}

export const DatasetChat = ({ 
  config, 
  fingerprint,
  isPaused, 
  isStopped,
  onProgress 
}: DatasetChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    const loadDataset = async () => {
      try {
        // Get dataset content
        const { data: dataset } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (!dataset) throw new Error('Dataset not found');

        // Download and parse CSV
        const { data: fileData } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].toLowerCase().split(',');
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text'
        );

        if (promptIndex === -1) throw new Error('No prompt column found in dataset');

        const extractedPrompts = lines.slice(1)
          .map(line => {
            const values = line.split(',');
            return values[promptIndex]?.trim();
          })
          .filter(Boolean);

        setPrompts(extractedPrompts);
        setMessages([{ 
          role: 'system', 
          content: `Loaded ${extractedPrompts.length} prompts from dataset`,
          timestamp: new Date().toISOString()
        }]);

      } catch (error) {
        console.error('Error loading dataset:', error);
        toast.error('Failed to load dataset');
        setMessages([{ 
          role: 'system', 
          content: `Error: ${error instanceof Error ? error.message : 'Failed to load dataset'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    loadDataset();
  }, [config.datasetId]);

  const processNextPrompt = async () => {
    if (isPaused || isStopped || isLoading || currentPromptIndex >= prompts.length) {
      return;
    }

    setIsLoading(true);
    const prompt = prompts[currentPromptIndex];

    try {
      // First augment the prompt using fingerprint results
      const { data: augmentData, error: augmentError } = await supabase.functions.invoke('process-contextual-scan', {
        body: {
          prompt,
          fingerprint,
          provider: config.provider,
          model: config.model
        }
      });

      if (augmentError) throw augmentError;

      const augmentedPrompt = augmentData.augmentedPrompt;

      // Add the augmented prompt to messages
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Original prompt: ${prompt}\nAugmented prompt: ${augmentedPrompt}`,
        timestamp: new Date().toISOString()
      }]);

      // Send augmented prompt to model
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt: augmentedPrompt
        }
      });

      if (error) throw error;

      // Add model's response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString()
      }]);

      // Update progress
      const progress = Math.round(((currentPromptIndex + 1) / prompts.length) * 100);
      onProgress(progress);

      setCurrentPromptIndex(prev => prev + 1);

    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Failed to process prompt');
      
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process prompt'}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (prompts.length > 0 && !isPaused && !isStopped) {
      processNextPrompt();
    }
  }, [currentPromptIndex, isPaused, isStopped, prompts.length]);

  return (
    <Card className="p-4">
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.timestamp && (
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && !isPaused && !isStopped && (
            <div className="flex justify-start">
              <div className="bg-accent rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};