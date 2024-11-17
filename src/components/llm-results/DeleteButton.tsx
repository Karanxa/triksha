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
      // First delete the scan record
      const { error: scanError } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId);

      if (scanError) {
        console.error("Error deleting scan:", scanError);
        throw scanError;
      }

      return scanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete scan");
    },
  });

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => deleteScan.mutate()}
      disabled={deleteScan.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};