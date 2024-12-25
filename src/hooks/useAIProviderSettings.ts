import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIProviderSettings } from "@/types/aiProvider";
import { Json } from "@/integrations/supabase/types/common";

export const useAIProviderSettings = () => {
  const [settings, setSettings] = useState<AIProviderSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('ai_provider_settings')
        .single();

      if (error) throw error;
      
      // Parse the JSON data with type checking
      const aiSettings = data?.ai_provider_settings as AIProviderSettings | null;
      setSettings(aiSettings || {
        provider: 'openai',
        model: 'gpt-4o-mini',
        customEndpoint: null
      });
    } catch (error) {
      console.error('Error loading AI provider settings:', error);
      toast.error('Failed to load AI provider settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: AIProviderSettings) => {
    try {
      // Convert AIProviderSettings to Json type for Supabase
      const settingsJson: Json = {
        provider: newSettings.provider,
        model: newSettings.model,
        customEndpoint: newSettings.customEndpoint || null
      };

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          ai_provider_settings: settingsJson,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      setSettings(newSettings);
      toast.success('AI provider settings updated');
    } catch (error) {
      console.error('Error updating AI provider settings:', error);
      toast.error('Failed to update AI provider settings');
    }
  };

  return { settings, isLoading, updateSettings };
};