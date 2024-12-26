import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <FileX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No scan results yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start by running your first LLM security scan to analyze potential vulnerabilities.
      </p>
      <Button 
        onClick={() => navigate('/llm-scanner')}
        className="bg-primary hover:bg-primary/90"
      >
        Start New Scan
      </Button>
    </div>
  );
};