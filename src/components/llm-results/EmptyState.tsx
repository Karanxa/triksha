import { Shield } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">No results found. Try running a scan first.</p>
      </div>
    </div>
  );
};