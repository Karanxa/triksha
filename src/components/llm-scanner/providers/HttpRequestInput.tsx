import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

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
  const [isValidRequest, setIsValidRequest] = useState(true);

  useEffect(() => {
    // Basic validation of HTTP request format
    const isValid = httpRequest.trim().startsWith('POST') || 
                   httpRequest.trim().startsWith('GET') ||
                   httpRequest.trim().startsWith('PUT') ||
                   httpRequest.trim().startsWith('DELETE');
    setIsValidRequest(isValid);
  }, [httpRequest]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>HTTP Request</Label>
        <Textarea
          placeholder={`POST /api/chat HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer your-token

{"message": "{PROMPT}"}`}
          value={httpRequest}
          onChange={(e) => onHttpRequestChange(e.target.value)}
          className="font-mono text-sm min-h-[300px]"
        />
        {!isValidRequest && httpRequest.trim() !== '' && (
          <Alert variant="destructive">
            <AlertDescription>
              Invalid HTTP request format. Request should start with HTTP method (POST, GET, etc.)
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          Enter your raw HTTP request. Headers and body will be parsed automatically.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Prompt Placeholder</Label>
        <Input
          placeholder="{PROMPT}"
          value={placeholder}
          onChange={(e) => onPlaceholderChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          This text will be replaced with the actual prompt in your request
        </p>
      </div>
    </div>
  );
};