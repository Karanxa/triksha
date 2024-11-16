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
        .eq('id', datasetId)
        .single();

      if (dbError) {
        console.error("Error deleting dataset:", dbError);
        throw dbError;
      }

      return datasetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-datasets'] });
      toast.success("Dataset deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete dataset");
    },
  });

  const handleDelete = async () => {
    try {
      await deleteDataset.mutateAsync();
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleteDataset.isPending}
      className="w-full"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};