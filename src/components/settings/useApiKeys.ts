import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApiKeys } from '@/integrations/supabase/types/common';

export const useApiKeys = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

      if (profile?.api_keys) {
        const keys = profile.api_keys as Record<string, string>;
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

  const handleChange = (key: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ api_keys: apiKeys })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      toast.success('API keys updated successfully');
    } catch (error) {
      console.error('Error updating API keys:', error);
      toast.error('Failed to update API keys');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    apiKeys,
    isLoading,
    isSaving,
    loadApiKeys,
    handleChange,
    handleSubmit
  };
};