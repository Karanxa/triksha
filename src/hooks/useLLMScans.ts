import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface CreateScanParams {
  prompt: string;
  provider: string;
  category: string;
  label?: string;
  schedule?: string;
  isRecurring?: boolean;
}

export const useLLMScans = () => {
  const queryClient = useQueryClient();

  const { data: scans, isLoading } = useQuery({
    queryKey: ['llm-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LLMScan[];
    },
  });

  const createScan = useMutation({
    mutationFn: async (params: CreateScanParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('llm_scans')
        .insert({
          user_id: userData.user.id,
          name: params.label || `Scan ${new Date().toISOString()}`,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Call the edge function to perform the scan
      const response = await supabase.functions.invoke('scan-llm', {
        body: { 
          scanId: data.id,
          prompt: params.prompt,
          provider: params.provider,
          category: params.category,
          schedule: params.schedule,
          isRecurring: params.isRecurring
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan initiated successfully");
    },
    onError: (error) => {
      toast.error("Failed to create scan: " + error.message);
    },
  });

  return {
    scans,
    isLoading,
    createScan: createScan.mutate,
    isScanning: createScan.isPending,
  };
};