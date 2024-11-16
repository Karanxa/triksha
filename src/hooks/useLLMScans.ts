import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { formatScanResponse } from "@/utils/scanUtils";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface CreateScanParams {
  prompts: string[];
  provider: string;
  category: string;
  label?: string;
  schedule?: string;
  isRecurring?: boolean;
  customEndpoint?: any;
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

      if (error) {
        toast.error("Failed to fetch scan results");
        throw error;
      }

      // Format the scan results consistently
      return (data as LLMScan[]).map(scan => ({
        ...scan,
        results: formatScanResponse(scan.results)
      }));
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
          status: 'pending',
          category: params.category,
          label: params.label,
          schedule: params.schedule,
          is_recurring: params.isRecurring,
        })
        .select()
        .single();

      if (error) throw error;

      // Call the edge function to perform the scan
      const response = await supabase.functions.invoke('scan-llm', {
        body: { 
          scanId: data.id,
          prompts: params.prompts,
          provider: params.provider,
          category: params.category,
          customEndpoint: params.customEndpoint
        }
      });

      if (response.error) throw response.error;
      
      // Format the response consistently
      const formattedResults = formatScanResponse(response.data);
      console.log("Formatted results:", formattedResults); // Debug log
      
      // Update the scan with the results
      const { error: updateError } = await supabase
        .from('llm_scans')
        .update({
          results: formattedResults,
          status: 'completed',
          is_vulnerable: formattedResults ? true : false // This will be refined by the vulnerability analysis
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
      
      return formattedResults;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
    },
    onError: (error) => {
      toast.error("Failed to create scan: " + error.message);
    },
  });

  return {
    scans,
    isLoading,
    createScan: createScan.mutateAsync,
    isScanning: createScan.isPending,
  };
};