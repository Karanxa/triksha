import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code } from "lucide-react";

interface CurlInputProps {
  curlCommand: string;
  placeholder: string;
  onCurlCommandChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
}

export const CurlInput = ({
  curlCommand,
  placeholder,
  onCurlCommandChange,
  onPlaceholderChange
}: CurlInputProps) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Code className="h-4 w-4" />
        <AlertDescription>
          Paste your curl command and replace the prompt text with {'{PROMPT}'} placeholder. 
          We'll automatically replace it with test prompts during scanning.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>cURL Command</Label>
        <Textarea
          placeholder={`curl -X POST https://your-llm-api.com/v1/chat/completions \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer your-api-key" \\
-d '{"messages": [{"role": "user", "content": "{PROMPT}"}]}'`}
          value={curlCommand}
          onChange={(e) => onCurlCommandChange(e.target.value)}
          className="font-mono text-sm min-h-[200px]"
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
          Replace the text in your cURL command that should be replaced with the prompt
        </p>
      </div>
    </div>
  );
};