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
      console.log('Attempting to delete scan:', scanId);
      
      const { error, data } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId)
        .select()
        .single();

      if (error) {
        console.error("Error deleting scan:", error);
        throw error;
      }

      console.log('Successfully deleted scan:', data);
      return data;
    },
    onSuccess: () => {
      // Immediately invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ['llm-scans']
      });
      toast.success("Scan deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(`Failed to delete scan: ${error.message}`);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteScan.mutateAsync();
    } catch (error) {
      console.error('Delete operation failed:', error);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleteScan.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};