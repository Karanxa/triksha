import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
        setApiKeys(profile.api_keys as ApiKeys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
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
      
      console.log('API keys saved successfully:', apiKeys);
    } catch (error) {
      console.error('Error saving API keys:', error);
      throw error;
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