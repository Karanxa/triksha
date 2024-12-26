import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProviderSelect from "../augment-prompt/ProviderSelect";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
  customEndpoint: any;
  onCustomEndpointChange: (endpoint: any) => void;
}

export const ScanFormProvider = ({
  provider,
  onProviderChange,
  customEndpoint,
  onCustomEndpointChange,
}: ScanFormProviderProps) => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("api_keys")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const hasApiKeys = profile?.api_keys && Object.values(profile.api_keys).some(key => key);

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />;
  }

  if (!hasApiKeys) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Keys Required</AlertTitle>
        <AlertDescription className="flex items-center gap-2">
          Please configure your API keys in Settings before using the LLM providers.
          <Button 
            variant="link" 
            onClick={() => navigate('/settings')}
            className="p-0 h-auto font-normal"
          >
            Go to Settings
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ProviderSelect
      value={provider}
      onValueChange={onProviderChange}
    />
  );
};