import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomEndpointInput } from "../providers/CustomEndpointInput";
import { useState } from "react";
import { CustomEndpoint } from "../types/CustomEndpoint";
import { Card, CardContent } from "@/components/ui/card";

export interface ModelSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
  customEndpoint?: CustomEndpoint;
  onCustomEndpointChange?: (endpoint: Partial<CustomEndpoint>) => void;
}

export const ModelSelector = ({ 
  provider, 
  model, 
  onProviderChange, 
  onModelChange,
  customEndpoint,
  onCustomEndpointChange
}: ModelSelectorProps) => {
  const [inputType, setInputType] = useState<'curl' | 'manual'>('curl');

  const getModelsForProvider = (provider: string) => {
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
      case "ollama":
        return [
          { value: "llama2", label: "Llama 2" },
          { value: "mistral", label: "Mistral" },
          { value: "codellama", label: "Code Llama" }
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="bg-card/50 border-muted/20">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select 
              value={provider} 
              onValueChange={(value) => {
                onProviderChange(value);
                onModelChange(""); // Reset model when provider changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
                <SelectItem value="custom">Custom Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider === 'custom' && onCustomEndpointChange && (
            <CustomEndpointInput
              customEndpoint={customEndpoint || {
                url: 'http://94.237.59.180:59397/process',
                apiKey: '',
                headers: '',
                placeholder: '{PROMPT}',
                curlCommand: 'curl --path-as-is -i -s -k -X $\'POST\' \\\n    -H $\'Host: 94.237.59.180:59397\' -H $\'Content-Length: 28\' -H $\'Accept: */*\' -H $\'X-Requested-With: XMLHttpRequest\' -H $\'X-CSRF-TOKEN: 99d21c72-d723-4fce-bccb-4f9c20dfae6a\' -H $\'Accept-Language: en-US\' -H $\'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.100 Safari/537.36\' -H $\'Content-Type: application/x-www-form-urlencoded; charset=UTF-8\' -H $\'Origin: http://94.237.59.180:59397\' -H $\'Referer: http://94.237.59.180:59397/bot.html\' -H $\'Accept-Encoding: gzip, deflate, br\' -H $\'Connection: keep-alive\' \\\n    -b $\'access_token_cookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczMjU0ODQxMSwianRpIjoiMzkxNmEyOTgtNGVjOS00ZGM4LTk1YTAtN2NlYjVkMGU2Yzk0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJsZXZlbCI6MX0sIm5iZiI6MTczMjU0ODQxMSwiY3NyZiI6Ijk5ZDIxYzcyLWQ3MjMtNGZjZS1iY2NiLTRmOWMyMGRmYWU2YSIsImV4cCI6MTczMjU0OTMxMX0.8Wf8Obkp0NPdS64MixH57FEGTXchpd4Dypci30Uck6c; csrf_access_token=99d21c72-d723-4fce-bccb-4f9c20dfae6a\' \\\n    --data-binary $\'text={PROMPT}&withCredentials=true\' \\\n    $\'http://94.237.59.180:59397/process\'',
                inputType: 'curl',
                method: 'POST'
              }}
              onCustomEndpointChange={onCustomEndpointChange}
              inputType={inputType}
              onInputTypeChange={setInputType}
            />
          )}

          {provider && provider !== 'custom' && (
            <div className="space-y-2">
              <Label>Model</Label>
              <Select 
                value={model} 
                onValueChange={onModelChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {getModelsForProvider(provider).map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};