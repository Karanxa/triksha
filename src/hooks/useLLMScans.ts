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

      return (data as LLMScan[]).map(scan => ({
        ...scan,
        results: formatScanResponse(scan.results)
      }));
    },
  });

  const createScan = useMutation({
    mutationFn: async (params: CreateScanParams) => {
      try {
        // Get the current user's ID
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");

        // Create the scan record first
        const { data: scan, error: createError } = await supabase
          .from('llm_scans')
          .insert({
            user_id: userData.user.id,
            name: params.label || `${new Date().toISOString()}`,
            status: 'pending',
            category: params.category,
            label: params.label,
            schedule: params.schedule,
            is_recurring: params.isRecurring,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Call the edge function with proper error handling
        const { data: response, error: functionError } = await supabase.functions.invoke('scan-llm', {
          body: { 
            scanId: scan.id,
            prompts: params.prompts,
            provider: params.provider,
            category: params.category,
            customEndpoint: params.customEndpoint
          }
        });

        if (functionError) {
          // Update scan status to failed if edge function fails
          await supabase
            .from('llm_scans')
            .update({ 
              status: 'failed',
              results: { error: functionError.message }
            })
            .eq('id', scan.id);
          
          throw functionError;
        }

        // Format the response consistently
        const formattedResults = formatScanResponse(response);
        
        return formattedResults;
      } catch (error: any) {
        console.error('Scan creation failed:', error);
        toast.error(error.message || 'Failed to create scan');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create scan: ${error.message}`);
    },
  });

  return {
    scans,
    isLoading,
    createScan: createScan.mutateAsync,
    isScanning: createScan.isPending,
  };
};