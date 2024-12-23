import { Shield } from "lucide-react";

interface ErrorStateProps {
  error: Error;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Shield className="h-12 w-12 text-destructive mx-auto" />
        <p className="text-destructive">Failed to load results: {error.message}</p>
      </div>
    </div>
  );
};