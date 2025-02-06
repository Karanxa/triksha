import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { checkSupabaseSetup } from "@/utils/supabaseSetup";

export const SetupChecker = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      const isSetup = await checkSupabaseSetup();
      setSetupComplete(isSetup);
      setIsChecking(false);
    };

    checkSetup();
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking system setup...</p>
        </div>
      </div>
    );
  }

  if (!setupComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              The required database tables and configurations are not set up in your Supabase project.
              Please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Supabase project's SQL editor</li>
              <li>Copy the initialization SQL from the project documentation</li>
              <li>Run the SQL commands to create the necessary tables and configurations</li>
              <li>Refresh this page after the setup is complete</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};