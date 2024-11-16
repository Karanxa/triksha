import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteButtonProps {
  scanId: string;
}

export const DeleteButton = ({ scanId }: DeleteButtonProps) => {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success('Scan deleted successfully');
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast.error('Failed to delete scan');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className="h-8 w-8 p-0"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
};