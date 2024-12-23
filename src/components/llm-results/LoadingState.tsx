import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-gray mx-auto" />
        <p className="text-sm text-muted-foreground">Loading results...</p>
      </div>
    </div>
  );
};