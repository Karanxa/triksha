import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface OllamaConfigProps {
  onConfigComplete: (config: {
    modelName: string;
    endpoint: string;
    isLocal: boolean;
    customCurl?: string;
  }) => void;
}

export const OllamaConfig = ({ onConfigComplete }: OllamaConfigProps) => {
  const [modelName, setModelName] = useState("");
  const [endpointType, setEndpointType] = useState<"local" | "remote">("local");
  const [remoteEndpoint, setRemoteEndpoint] = useState("");
  const [customCurl, setCustomCurl] = useState("");

  const handleSubmit = () => {
    if (!modelName) {
      toast.error("Please enter a model name");
      return;
    }

    if (endpointType === "remote" && !remoteEndpoint) {
      toast.error("Please enter the remote endpoint URL");
      return;
    }

    onConfigComplete({
      modelName,
      endpoint: endpointType === "local" ? "http://localhost:11434" : remoteEndpoint,
      isLocal: endpointType === "local",
      customCurl: endpointType === "remote" ? customCurl : undefined
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Model Name</Label>
          <Input
            placeholder="e.g., llama2, mistral, codellama"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Endpoint Type</Label>
          <RadioGroup
            value={endpointType}
            onValueChange={(value: "local" | "remote") => setEndpointType(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local">Local System (localhost)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="remote" />
              <Label htmlFor="remote">Remote Endpoint</Label>
            </div>
          </RadioGroup>
        </div>

        {endpointType === "remote" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Remote Endpoint URL</Label>
              <Input
                placeholder="https://your-ollama-endpoint.com"
                value={remoteEndpoint}
                onChange={(e) => setRemoteEndpoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Custom cURL Command (Optional)</Label>
              <Input
                placeholder="Enter your custom cURL command with {MODEL} and {PROMPT} placeholders"
                value={customCurl}
                onChange={(e) => setCustomCurl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Use {"{MODEL}"} and {"{PROMPT}"} as placeholders in your cURL command
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full">
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};