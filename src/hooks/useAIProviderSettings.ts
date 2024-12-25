import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIProviderSettings, AIProviderSettingsJson } from "@/types/aiProvider";
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
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, use default values
      const aiSettings = data?.ai_provider_settings as AIProviderSettingsJson | null;
      
      setSettings(aiSettings ? {
        provider: aiSettings.provider,
        model: aiSettings.model,
        customEndpoint: aiSettings.customEndpoint
      } : {
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
      // Convert AIProviderSettings to Json compatible type
      const settingsJson: AIProviderSettingsJson = {
        provider: newSettings.provider,
        model: newSettings.model,
        customEndpoint: newSettings.customEndpoint
      };

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          ai_provider_settings: settingsJson as Json,
          provider: 'ai', // Required field based on the table schema
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      setSettings(newSettings);
      toast.success('AI provider settings updated');
    } catch (error) {
      console.error('Error updating AI provider settings:', error);
      toast.error('Failed to update AI provider settings');
      throw error;
    }
  };

  return { settings, isLoading, updateSettings };
};