import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  httpRequest: string;
  inputType: 'curl' | 'manual' | 'http';
  method: string;
}

interface CustomEndpointInputProps {
  customEndpoint: CustomEndpoint;
  onCustomEndpointChange: (endpoint: Partial<CustomEndpoint>) => void;
}

export const CustomEndpointInput = ({ 
  customEndpoint,
  onCustomEndpointChange
}: CustomEndpointInputProps) => {
  const handleInputTypeChange = (value: 'curl' | 'manual' | 'http') => {
    onCustomEndpointChange({
      inputType: value,
      url: '',
      apiKey: '',
      headers: '',
      curlCommand: '',
      httpRequest: '',
      placeholder: '{PROMPT}',
      method: 'POST'
    });
  };

  const handleCustomEndpointChange = (field: keyof CustomEndpoint, value: string) => {
    onCustomEndpointChange({
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Method</Label>
        <RadioGroup
          value={customEndpoint.inputType}
          onValueChange={(value: 'curl' | 'manual' | 'http') => handleInputTypeChange(value)}
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="http" id="http" />
            <Label htmlFor="http">HTTP Request</Label>
          </div>
        </RadioGroup>
      </div>

      {customEndpoint.inputType === 'curl' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>cURL Command</Label>
            <Textarea
              placeholder="Enter your cURL command here"
              value={customEndpoint.curlCommand}
              onChange={(e) => handleCustomEndpointChange('curlCommand', e.target.value)}
              className="font-mono text-sm min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Prompt Placeholder</Label>
            <Input
              placeholder="{PROMPT}"
              value={customEndpoint.placeholder}
              onChange={(e) => handleCustomEndpointChange('placeholder', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Replace the text in your cURL command that should be replaced with the prompt
            </p>
          </div>
        </div>
      )}

      {customEndpoint.inputType === 'http' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <Select 
              value={customEndpoint.method} 
              onValueChange={(value) => handleCustomEndpointChange('method', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Request URL</Label>
            <Input
              placeholder="https://api.example.com/endpoint"
              value={customEndpoint.url}
              onChange={(e) => handleCustomEndpointChange('url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Headers (JSON format)</Label>
            <Textarea
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer your-token"}'
              value={customEndpoint.headers}
              onChange={(e) => handleCustomEndpointChange('headers', e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Request Body</Label>
            <Textarea
              placeholder='{"message": "{PROMPT}", "options": {"temperature": 0.7}}'
              value={customEndpoint.httpRequest}
              onChange={(e) => handleCustomEndpointChange('httpRequest', e.target.value)}
              className="font-mono text-sm min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Prompt Placeholder</Label>
            <Input
              placeholder="{PROMPT}"
              value={customEndpoint.placeholder}
              onChange={(e) => handleCustomEndpointChange('placeholder', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Use this placeholder in your request body where you want to insert the prompt
            </p>
          </div>
        </div>
      )}

      {customEndpoint.inputType === 'manual' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Custom Endpoint URL</Label>
            <Input
              placeholder="https://your-custom-endpoint.com"
              value={customEndpoint.url}
              onChange={(e) => handleCustomEndpointChange('url', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom API Key</Label>
            <Input
              type="password"
              placeholder="Enter your custom API key"
              value={customEndpoint.apiKey}
              onChange={(e) => handleCustomEndpointChange('apiKey', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Headers (Optional JSON)</Label>
            <Textarea
              placeholder='{"Authorization": "Bearer your-token"}'
              value={customEndpoint.headers}
              onChange={(e) => handleCustomEndpointChange('headers', e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt Placeholder</Label>
            <Input
              placeholder="{PROMPT}"
              value={customEndpoint.placeholder}
              onChange={(e) => handleCustomEndpointChange('placeholder', e.target.value)}
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