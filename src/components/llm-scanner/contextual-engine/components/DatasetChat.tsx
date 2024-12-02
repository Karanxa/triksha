import { useState, useEffect } from "react";
import { Message, ApiKeys } from "../types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TypingIndicator } from "../../chat/TypingIndicator";

interface DatasetChatProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
    customEndpoint?: {
      url: string;
      apiKey: string;
      headers: string;
      method: string;
    };
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
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);

  // Fetch API keys from user profile
  useEffect(() => {
    const fetchApiKeys = async () => {
      console.log('Fetching API keys...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching API keys:', error);
        toast.error("Failed to fetch API keys");
        return;
      }

      console.log('API keys fetched successfully:', {
        hasOpenAI: !!profile.api_keys?.openai,
        hasAnthropic: !!profile.api_keys?.anthropic,
        provider: config.provider
      });
      setApiKeys(profile.api_keys as ApiKeys);
    };

    fetchApiKeys();
  }, [config.provider]);

  // Load dataset prompts
  useEffect(() => {
    const loadDataset = async () => {
      console.log('Loading dataset:', config.datasetId);
      try {
        const { data: dataset } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (!dataset) throw new Error('Dataset not found');
        console.log('Dataset found:', dataset.name);

        const { data: fileData } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        console.log('Dataset file downloaded');
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

        console.log(`Extracted ${extractedPrompts.length} prompts from dataset`);
        setPrompts(extractedPrompts);
        setMessages([{ 
          role: 'system', 
          content: `Loaded ${extractedPrompts.length} prompts from dataset`,
          timestamp: new Date().toISOString()
        }]);

      } catch (error) {
        console.error('Error loading dataset:', error);
        toast.error('Failed to load dataset');
      }
    };

    loadDataset();
  }, [config.datasetId]);

  // Process prompts
  useEffect(() => {
    const processNextPrompt = async () => {
      if (isPaused || isStopped || isLoading || currentPromptIndex >= prompts.length || !apiKeys) {
        console.log('Skipping prompt processing:', {
          isPaused,
          isStopped,
          isLoading,
          currentPromptIndex,
          totalPrompts: prompts.length,
          hasApiKeys: !!apiKeys
        });
        return;
      }

      setIsLoading(true);
      const prompt = prompts[currentPromptIndex];
      console.log('Processing prompt:', { index: currentPromptIndex, prompt });

      try {
        const providerKey = config.provider.toLowerCase() as keyof ApiKeys;
        console.log('Calling process-dynamic-scan function...', {
          provider: config.provider,
          model: config.model,
          hasApiKey: !!apiKeys[providerKey]
        });
        
        const startTime = Date.now();
        const { data, error } = await supabase.functions.invoke('process-dynamic-scan', {
          body: {
            provider: config.provider,
            model: config.model,
            prompt,
            apiKey: apiKeys[providerKey],
            customEndpoint: config.customEndpoint
          }
        });
        const endTime = Date.now();
        console.log('Edge function response:', { 
          error: error?.message,
          hasData: !!data,
          responseTime: `${endTime - startTime}ms`
        });

        if (error) throw error;
        if (!data?.response) throw new Error('No response received from model');

        console.log('Adding messages to chat:', {
          prompt,
          responseLength: data.response.length
        });

        setMessages(prev => [
          ...prev,
          { role: 'user', content: prompt, timestamp: new Date().toISOString() },
          { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }
        ]);

        const progress = Math.round(((currentPromptIndex + 1) / prompts.length) * 100);
        onProgress(progress);
        console.log('Progress updated:', progress);

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

    const timer = setTimeout(processNextPrompt, 1000);
    return () => clearTimeout(timer);
  }, [currentPromptIndex, isPaused, isStopped, prompts.length, config, isLoading, apiKeys]);

  return (
    <Card className="p-4">
      <ScrollArea className="h-[600px]">
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
          {isLoading && !isPaused && !isStopped && <TypingIndicator />}
        </div>
      </ScrollArea>
    </Card>
  );
};