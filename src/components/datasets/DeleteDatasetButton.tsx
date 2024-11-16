import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DeleteDatasetButtonProps {
  datasetId: string;
  filePath: string | null;
}

export const DeleteDatasetButton = ({ datasetId, filePath }: DeleteDatasetButtonProps) => {
  const queryClient = useQueryClient();

  const deleteDataset = useMutation({
    mutationFn: async () => {
      // First delete the file from storage if it exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('datasets')
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting file:", storageError);
          throw storageError;
        }
      }

      // Then delete the dataset record
      const { error: dbError } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId);

      if (dbError) {
        console.error("Error deleting dataset:", dbError);
        throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-datasets'] });
      toast.success("Dataset deleted successfully");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete dataset");
    },
  });

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => deleteDataset.mutate()}
      disabled={deleteDataset.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};