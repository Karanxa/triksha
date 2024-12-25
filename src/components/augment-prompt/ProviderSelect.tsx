import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

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
    // Check if API key is configured for selected provider
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

  const getModelsForProvider = () => {
    const provider = value.split('-')[0];
    switch (provider) {
      case "openai":
        return [
          { value: "gpt-4o", label: "GPT-4 Opus" },
          { value: "gpt-4o-mini", label: "GPT-4 Opus Mini" }
        ];
      case "anthropic":
        return [
          { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
          { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" }
        ];
      case "google":
        return [
          { value: "gemini-1.0-pro", label: "Gemini Pro" },
          { value: "gemini-1.0-ultra", label: "Gemini Ultra" }
        ];
      default:
        return [];
    }
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
          <Select 
            value={value.split('-')[1] || ""} 
            onValueChange={handleModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {getModelsForProvider().map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedProvider === "custom" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>cURL Command</Label>
              <Textarea
                placeholder="Enter your cURL command here"
                value={curlCommand}
                onChange={(e) => handleCurlCommandChange(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt Placeholder</Label>
              <Input
                placeholder="{PROMPT}"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Replace the text in your cURL command that should be replaced with the prompt
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSelect;