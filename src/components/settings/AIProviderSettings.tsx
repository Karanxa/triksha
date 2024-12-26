import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAIProviderSettings } from "@/hooks/useAIProviderSettings";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const AIProviderSettings = () => {
  const { settings, isLoading, updateSettings } = useAIProviderSettings();
  const [providerType, setProviderType] = useState(settings?.provider || "openai");
  const [curlCommand, setCurlCommand] = useState(settings?.customEndpoint?.curlCommand || "");
  const [placeholder, setPlaceholder] = useState(settings?.customEndpoint?.placeholder || "{PROMPT}");

  const handleSave = async () => {
    try {
      await updateSettings({
        provider: providerType,
        model: providerType === "openai" ? "gpt-4o-mini" : "custom",
        customEndpoint: providerType === "custom" ? {
          curlCommand,
          placeholder
        } : null
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>AI Provider Settings</CardTitle>
        <CardDescription>
          Configure your AI provider settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-center">
          <Label>Provider Type</Label>
          <RadioGroup
            value={providerType}
            onValueChange={setProviderType}
            className="flex flex-col items-center space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai">OpenAI (Default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Endpoint</Label>
            </div>
          </RadioGroup>
        </div>

        {providerType === "custom" && (
          <>
            <div className="space-y-2">
              <Label className="text-center block">cURL Command</Label>
              <Textarea
                placeholder="Enter your cURL command here"
                value={curlCommand}
                onChange={(e) => setCurlCommand(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-center block">Prompt Placeholder</Label>
              <Input
                placeholder="{PROMPT}"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
              />
            </div>
          </>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};