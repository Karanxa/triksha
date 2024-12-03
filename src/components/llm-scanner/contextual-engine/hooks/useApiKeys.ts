import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApiKeys } from "@/integrations/supabase/types/common";

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
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

        if (error) throw error;

        if (typeof profile.api_keys === 'object' && profile.api_keys !== null) {
          setApiKeys(profile.api_keys as ApiKeys);
        } else {
          console.error('Invalid API keys format:', profile.api_keys);
          toast.error("Invalid API keys format");
        }
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast.error("Failed to fetch API keys");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  return { apiKeys, isLoading };
};