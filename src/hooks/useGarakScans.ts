import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateScanParams {
  name: string;
  model: string;
  prompts: string[];
  testSuites: string[];
  config?: Record<string, any>;
}

export const useGarakScans = () => {
  const queryClient = useQueryClient();

  const createScan = useMutation({
    mutationFn: async (params: CreateScanParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Create the scan record
      const { data: scan, error: createError } = await supabase
        .from('garak_scans')
        .insert({
          user_id: userData.user.id,
          name: params.name,
          model: params.model,
          prompts: params.prompts,
          test_suites: params.testSuites,
          config: params.config,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Call the Garak edge function
      const response = await supabase.functions.invoke('garak-scan', {
        body: {
          scanId: scan.id,
          prompt: params.prompts[0], // For now, just test the first prompt
          model: params.model,
          tests: params.testSuites
        }
      });

      if (response.error) throw response.error;

      // Update the scan with results
      const { error: updateError } = await supabase
        .from('garak_scans')
        .update({
          results: response.data,
          status: 'completed'
        })
        .eq('id', scan.id);

      if (updateError) throw updateError;

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garak-scans'] });
    },
    onError: (error) => {
      toast.error("Failed to create scan: " + error.message);
    },
  });

  return {
    createScan: createScan.mutateAsync,
    isScanning: createScan.isPending,
  };
};