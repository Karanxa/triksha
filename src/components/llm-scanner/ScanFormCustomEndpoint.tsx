import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

interface ScanFormCustomEndpointProps {
  customEndpoint: CustomEndpoint;
  onCustomEndpointChange: (endpoint: Partial<CustomEndpoint>) => void;
}

export const ScanFormCustomEndpoint = ({
  customEndpoint,
  onCustomEndpointChange,
}: ScanFormCustomEndpointProps) => {
  const handleInputTypeChange = (value: 'curl' | 'manual') => {
    onCustomEndpointChange({
      inputType: value,
      // Reset fields when switching input type
      url: '',
      apiKey: '',
      headers: '',
      curlCommand: '',
      placeholder: '{PROMPT}'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Method</Label>
        <RadioGroup
          value={customEndpoint.inputType}
          onValueChange={handleInputTypeChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="curl" id="curl" />
            <Label htmlFor="curl">cURL Command</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manual Configuration</Label>
          </div>
        </RadioGroup>
      </div>

      {customEndpoint.inputType === 'curl' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>cURL Command</Label>
            <Textarea
              placeholder="Enter your cURL command here"
              value={customEndpoint.curlCommand}
              onChange={(e) => onCustomEndpointChange({ curlCommand: e.target.value })}
              className="font-mono text-sm min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Prompt Placeholder</Label>
            <Input
              placeholder="{PROMPT}"
              value={customEndpoint.placeholder}
              onChange={(e) => onCustomEndpointChange({ placeholder: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Replace the text in your cURL command that should be replaced with the prompt
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Custom Endpoint URL</Label>
            <Input
              placeholder="https://your-custom-endpoint.com"
              value={customEndpoint.url}
              onChange={(e) => onCustomEndpointChange({ url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom API Key</Label>
            <Input
              type="password"
              placeholder="Enter your custom API key"
              value={customEndpoint.apiKey}
              onChange={(e) => onCustomEndpointChange({ apiKey: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Headers (Optional JSON)</Label>
            <Textarea
              placeholder='{"Authorization": "Bearer your-token"}'
              value={customEndpoint.headers}
              onChange={(e) => onCustomEndpointChange({ headers: e.target.value })}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt Placeholder</Label>
            <Input
              placeholder="{PROMPT}"
              value={customEndpoint.placeholder}
              onChange={(e) => onCustomEndpointChange({ placeholder: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Specify where to insert the prompt in your request
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
