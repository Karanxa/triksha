import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
      <div className="space-y-2">
        <Label>cURL Command</Label>
        <Textarea
          placeholder="Enter your cURL command here"
          value={curlCommand}
          onChange={(e) => onCurlCommandChange(e.target.value)}
          className="font-mono text-sm min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          Enter your complete cURL command. Replace the text that should be replaced with the prompt using the placeholder below.
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
          This text will be replaced with the actual prompt in your cURL command during scanning
        </p>
      </div>
    </div>
  );
};