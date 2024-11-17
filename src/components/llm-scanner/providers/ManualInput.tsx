import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ManualInputProps {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  onUrlChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onHeadersChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
}

export const ManualInput = ({
  url,
  apiKey,
  headers,
  placeholder,
  onUrlChange,
  onApiKeyChange,
  onHeadersChange,
  onPlaceholderChange
}: ManualInputProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Custom Endpoint URL</Label>
        <Input
          placeholder="https://your-custom-endpoint.com"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Custom API Key</Label>
        <Input
          type="password"
          placeholder="Enter your custom API key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Custom Headers (Optional JSON)</Label>
        <Textarea
          placeholder='{"Authorization": "Bearer your-token"}'
          value={headers}
          onChange={(e) => onHeadersChange(e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Prompt Placeholder</Label>
        <Input
          placeholder="{PROMPT}"
          value={placeholder}
          onChange={(e) => onPlaceholderChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Specify where to insert the prompt in your request
        </p>
      </div>
    </div>
  );
};