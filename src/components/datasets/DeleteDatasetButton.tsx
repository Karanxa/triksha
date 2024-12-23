import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface DeleteDatasetButtonProps {
  datasetId: string
  filePath: string | null
}

export const DeleteDatasetButton = ({ datasetId, filePath }: DeleteDatasetButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: deleteDataset, isPending } = useMutation({
    mutationFn: async () => {
      // First check if dataset exists
      const { data: dataset, error: fetchError } = await supabase
        .from('datasets')
        .select()
        .eq('id', datasetId)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!dataset) throw new Error('Dataset not found')

      // If there's a file, delete it first
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('datasets')
          .remove([filePath])

        if (storageError) throw storageError
      }

      // Then delete the dataset record
      const { error: deleteError } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId)

      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-datasets'] })
      toast.success("Dataset deleted successfully")
      setIsOpen(false)
    },
    onError: (error: Error) => {
      console.error("Delete error:", error)
      toast.error("Failed to delete dataset: " + error.message)
      setIsOpen(false)
    }
  })

  const handleDelete = async () => {
    try {
      await deleteDataset()
    } catch (error) {
      console.error("Error deleting dataset:", error)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the dataset
            and all its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}