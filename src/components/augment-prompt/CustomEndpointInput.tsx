import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomEndpointInputProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const CustomEndpointInput = ({ value, onValueChange }: CustomEndpointInputProps) => {
  const [curlCommand, setCurlCommand] = useState("");
  const [placeholder, setPlaceholder] = useState("{PROMPT}");

  const handleCurlCommandChange = (command: string) => {
    setCurlCommand(command);
    onValueChange(`custom-${command}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>cURL Command</Label>
        <Textarea
          placeholder="Enter your cURL command here"
          value={curlCommand}
          onChange={(e) => handleCurlCommandChange(e.target.value)}
          className="font-mono text-sm min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          This endpoint will be used for vulnerability detection. Make sure it accepts a prompt and returns a vulnerability assessment.
        </p>
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
  );
};