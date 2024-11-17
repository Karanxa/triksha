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
      // First check if the scan exists
      const { data: scanExists, error: checkError } = await supabase
        .from('llm_scans')
        .select('id')
        .eq('id', scanId);

      if (checkError) {
        console.error("Error checking scan:", checkError);
        throw new Error('Failed to verify scan existence');
      }

      if (!scanExists || scanExists.length === 0) {
        throw new Error('Scan not found');
      }

      // Delete all related scan results first
      const { error: resultsError } = await supabase
        .from('llm_scan_results')
        .delete()
        .eq('batch_id', scanId);

      if (resultsError) {
        console.error("Error deleting scan results:", resultsError);
        throw new Error('Failed to delete scan results');
      }

      // Then delete the main scan record
      const { error: scanError } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId);

      if (scanError) {
        console.error("Error deleting scan:", scanError);
        throw new Error('Failed to delete scan');
      }

      // Verify deletion by checking if the scan still exists
      const { data: verifyData, error: verifyError } = await supabase
        .from('llm_scans')
        .select('id')
        .eq('id', scanId);

      if (verifyError) {
        console.error("Error verifying deletion:", verifyError);
        throw new Error('Failed to verify deletion');
      }

      // If we find any data, the deletion failed
      if (verifyData && verifyData.length > 0) {
        throw new Error('Deletion verification failed - scan still exists');
      }

      return scanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast.error(`Failed to delete scan: ${error.message}`);
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