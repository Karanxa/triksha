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
      // Start a Postgres transaction to ensure atomicity
      const { data: client } = await supabase.rpc('begin_transaction');

      try {
        // Delete all related scan results first
        const { error: resultsError } = await supabase
          .from('llm_scan_results')
          .delete()
          .eq('batch_id', scanId);

        if (resultsError) {
          throw new Error(`Failed to delete scan results: ${resultsError.message}`);
        }

        // Then delete the main scan record
        const { error: scanError } = await supabase
          .from('llm_scans')
          .delete()
          .eq('id', scanId);

        if (scanError) {
          throw new Error(`Failed to delete scan: ${scanError.message}`);
        }

        return scanId;
      } catch (error) {
        // If any error occurs, throw it to trigger the onError callback
        throw error;
      }
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