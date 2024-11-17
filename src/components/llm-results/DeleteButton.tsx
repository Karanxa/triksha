import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteButtonProps {
  scanId: string;
}

export const DeleteButton = ({ scanId }: DeleteButtonProps) => {
  const queryClient = useQueryClient();

  const deleteScan = useMutation({
    mutationFn: async () => {
      // First delete all related scan results
      const { error: resultsError } = await supabase
        .from('llm_scan_results')
        .delete()
        .eq('batch_id', scanId);

      if (resultsError) {
        console.error("Error deleting scan results:", resultsError);
        throw resultsError;
      }

      // Then delete the main scan record
      const { error: scanError } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId);

      if (scanError) {
        console.error("Error deleting scan:", scanError);
        throw scanError;
      }

      // Verify deletion by attempting to fetch the deleted scan
      const { data: verifyData, error: verifyError } = await supabase
        .from('llm_scans')
        .select()
        .eq('id', scanId)
        .single();

      if (verifyError?.code === 'PGRST116') {
        // PGRST116 means no rows returned, which is what we want
        return scanId;
      } else if (verifyData) {
        // If we still find the scan, deletion failed
        throw new Error('Deletion verification failed - scan still exists');
      }

      return scanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete scan - please try again");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleteScan.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the scan and all its associated results.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteScan.mutate()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};