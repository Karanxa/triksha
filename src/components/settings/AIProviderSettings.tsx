import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAIProviderSettings } from "@/hooks/useAIProviderSettings";
import { useState } from "react";
import { toast } from "sonner";

export const AIProviderSettings = () => {
  const { settings, isLoading, updateSettings } = useAIProviderSettings();
  const [curlCommand, setCurlCommand] = useState(settings?.customEndpoint?.curlCommand || "");
  const [placeholder, setPlaceholder] = useState(settings?.customEndpoint?.placeholder || "{PROMPT}");

  const handleSave = async () => {
    try {
      await updateSettings({
        provider: "custom",
        model: "custom",
        customEndpoint: {
          curlCommand,
          placeholder
        }
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Settings</CardTitle>
        <CardDescription>
          Configure your custom endpoint for LLM interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>cURL Command</Label>
          <Textarea
            placeholder="Enter your cURL command here"
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            className="font-mono text-sm min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Paste your complete cURL command. The placeholder text will be replaced with the actual prompt.
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
            This text will be replaced with the actual prompt in your cURL command
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};