import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { CustomEndpointConfig } from "./providers/CustomEndpointConfig";
import { ModelSelector } from "./providers/ModelSelector";

interface ProviderSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const ProviderSelect = ({ value, onValueChange }: ProviderSelectProps) => {
  const [curlCommand, setCurlCommand] = useState("");
  const [placeholder, setPlaceholder] = useState("{PROMPT}");
  const [apiKeys, setApiKeys] = useState<any>(null);
  const session = useSession();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      if (error) throw error;
      setApiKeys(profile?.api_keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleProviderChange = (newValue: string) => {
    if (newValue !== 'custom') {
      const keyName = getApiKeyName(newValue);
      if (!apiKeys?.[keyName]) {
        toast.error(`Please configure your ${newValue.toUpperCase()} API key in Settings first`);
        navigate('/settings');
        return;
      }
    }

    if (newValue === "custom") {
      onValueChange(`custom-${curlCommand}`);
    } else {
      onValueChange(newValue);
      setCurlCommand("");
    }
  };

  const getApiKeyName = (provider: string): string => {
    switch (provider) {
      case 'openai': return 'openai';
      case 'anthropic': return 'anthropic';
      case 'google': return 'gemini';
      default: return '';
    }
  };

  const handleModelChange = (model: string) => {
    onValueChange(`${value.split('-')[0]}-${model}`);
  };

  const handleCurlCommandChange = (command: string) => {
    setCurlCommand(command);
    onValueChange(`custom-${command}`);
  };

  const selectedProvider = value.split('-')[0];

  if (!apiKeys) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Keys Required</AlertTitle>
        <AlertDescription>
          Please configure your API keys in Settings before using the LLM providers.
          <Button 
            variant="link" 
            onClick={() => navigate('/settings')}
            className="p-0 ml-2"
          >
            Go to Settings
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Select AI Provider & Model
      </label>
      <div className="space-y-4">
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic" disabled className="flex items-center justify-between">
              Anthropic <Badge variant="outline" className="ml-2">Coming Soon</Badge>
            </SelectItem>
            <SelectItem value="google" disabled className="flex items-center justify-between">
              Google AI <Badge variant="outline" className="ml-2">Coming Soon</Badge>
            </SelectItem>
            <SelectItem value="custom">Custom Endpoint</SelectItem>
          </SelectContent>
        </Select>

        {selectedProvider && selectedProvider !== "custom" && (
          <ModelSelector
            provider={selectedProvider}
            model={value.split('-')[1] || ""}
            onModelChange={handleModelChange}
          />
        )}

        {selectedProvider === "custom" && (
          <CustomEndpointConfig
            curlCommand={curlCommand}
            placeholder={placeholder}
            onCurlCommandChange={handleCurlCommandChange}
            onPlaceholderChange={setPlaceholder}
          />
        )}
      </div>
    </div>
  );
};

export default ProviderSelect;