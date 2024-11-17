import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DeleteButtonProps {
  scanId: string;
}

export const DeleteButton = ({ scanId }: DeleteButtonProps) => {
  const queryClient = useQueryClient();

  const deleteScan = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId);

      if (error) {
        console.error("Error deleting scan:", error);
        throw error;
      }

      return scanId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ['llm-scans'],
        refetchType: 'all'
      });
      toast.success("Scan deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(`Failed to delete scan: ${error.message}`);
    },
  });

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => {
        console.log('Deleting scan:', scanId);
        deleteScan.mutate();
      }}
      disabled={deleteScan.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};