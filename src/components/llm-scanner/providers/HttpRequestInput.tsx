import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface HttpRequestInputProps {
  httpRequest: string;
  placeholder: string;
  onHttpRequestChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
}

export const HttpRequestInput = ({
  httpRequest,
  placeholder,
  onHttpRequestChange,
  onPlaceholderChange
}: HttpRequestInputProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>HTTP Request</Label>
        <Textarea
          placeholder={`POST /v1/chat/completions HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer your-token

{
  "messages": [
    {
      "role": "user", 
      "content": "{PROMPT}"
    }
  ]
}`}
          value={httpRequest}
          onChange={(e) => onHttpRequestChange(e.target.value)}
          className="font-mono text-sm min-h-[300px]"
        />
        <p className="text-sm text-muted-foreground">
          Enter your raw HTTP request. Use {"{PROMPT}"} where you want to insert the test prompt.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Prompt Placeholder</Label>
        <Input
          placeholder="{PROMPT}"
          value={placeholder}
          onChange={(e) => onPlaceholderChange(e.target.value)}
        />
      </div>
    </div>
  );
};