import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DeleteButtonProps {
  scanId: string;
}

export const DeleteButton = ({ scanId }: DeleteButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteScan = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      const { error } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onError: (error) => {
      setIsDeleting(false);
      toast.error("Failed to delete scan: " + error.message);
    },
  });

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => deleteScan.mutate(scanId)}
      className={cn(
        "transition-all duration-300",
        isDeleting && "animate-fade-out opacity-0 scale-95"
      )}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};