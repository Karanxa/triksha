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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete scan: " + error.message);
    },
  });

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => deleteScan.mutate(scanId)}
      disabled={deleteScan.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};