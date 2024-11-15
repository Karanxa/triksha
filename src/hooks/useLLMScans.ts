import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      return data;
    },
  });

  const createScan = useMutation({
    mutationFn: async (prompt: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('scan-llm', {
        body: { prompt, userId: userData.user.id },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan completed successfully");
    },
    onError: (error) => {
      toast.error("Failed to complete scan: " + error.message);
    },
  });

  return {
    scans,
    isLoading,
    createScan: createScan.mutate,
    isScanning: createScan.isPending,
  };
};