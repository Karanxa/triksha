import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAIProviderSettings } from "@/hooks/useAIProviderSettings";
import { useState } from "react";
import { toast } from "sonner";

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
          Configure your AI provider settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Provider Type</Label>
          <RadioGroup
            value={providerType}
            onValueChange={setProviderType}
            className="flex flex-col space-y-2"
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
              <Label>cURL Command</Label>
              <Textarea
                placeholder="Enter your cURL command here"
                value={curlCommand}
                onChange={(e) => setCurlCommand(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt Placeholder</Label>
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