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
        console.error('Error fetching scans:', error);
        throw new Error('Failed to fetch scan results');
      }

      return (data as LLMScan[]).map(scan => ({
        ...scan,
        results: formatScanResponse(scan.results)
      }));
    },
  });

  const createScan = useMutation({
    mutationFn: async (params: CreateScanParams) => {
      // Get the current user's ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Authentication required");
      }

      // Create the scan record
      const { data: scan, error: createError } = await supabase
        .from('llm_scans')
        .insert({
          user_id: userData.user.id,
          name: params.label || `Scan ${new Date().toLocaleString()}`,
          status: 'pending',
          category: params.category,
          label: params.label,
          schedule: params.schedule,
          is_recurring: params.isRecurring,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating scan:', createError);
        throw new Error('Failed to create scan record');
      }

      // Call the edge function
      const { data: response, error: functionError } = await supabase.functions.invoke('scan-llm', {
        body: { 
          scanId: scan.id,
          prompts: params.prompts,
          provider: params.provider,
          category: params.category,
          customEndpoint: params.customEndpoint
        }
      });

      if (functionError || (response && 'error' in response)) {
        const errorMessage = functionError?.message || (response as any)?.error || 'Scan failed';
        console.error('Scan function error:', errorMessage);
        throw new Error(errorMessage);
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success('Scan completed successfully');
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`Scan failed: ${error.message}`);
    },
  });

  return {
    scans,
    isLoading,
    createScan: createScan.mutateAsync,
    isScanning: createScan.isPending,
  };
};