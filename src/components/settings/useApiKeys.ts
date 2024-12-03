import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
  huggingface: string;
  github: string;
  ollama_endpoint: string;
}

export const useApiKeys = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    gemini: '',
    huggingface: '',
    github: '',
    ollama_endpoint: ''
  });

  const loadApiKeys = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      if (error) throw error;

      if (profile?.api_keys && typeof profile.api_keys === 'object') {
        const keys = profile.api_keys as ApiKeys;
        setApiKeys({
          openai: keys.openai || '',
          anthropic: keys.anthropic || '',
          gemini: keys.gemini || '',
          huggingface: keys.huggingface || '',
          github: keys.github || '',
          ollama_endpoint: keys.ollama_endpoint || ''
        });
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApiKeys = async (newKeys: Partial<ApiKeys>) => {
    try {
      const updatedKeys = { ...apiKeys, ...newKeys };
      const { error } = await supabase
        .from('profiles')
        .update({ api_keys: updatedKeys })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setApiKeys(updatedKeys);
      toast.success('API keys updated successfully');
    } catch (error) {
      console.error('Error updating API keys:', error);
      toast.error('Failed to update API keys');
    }
  };

  return {
    apiKeys,
    isLoading,
    loadApiKeys,
    updateApiKeys
  };
};