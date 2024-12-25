import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAIProviderSettings } from "@/hooks/useAIProviderSettings";
import { useState } from "react";
import { toast } from "sonner";
import { AIProviderSettings as AIProviderSettingsType } from "@/types/aiProvider";

export const AIProviderSettings = () => {
  const { settings, isLoading, updateSettings } = useAIProviderSettings();
  const [provider, setProvider] = useState(settings?.provider || 'openai');
  const [model, setModel] = useState(settings?.model || 'gpt-4o-mini');
  const [curlCommand, setCurlCommand] = useState(settings?.customEndpoint?.curlCommand || '');
  const [placeholder, setPlaceholder] = useState(settings?.customEndpoint?.placeholder || '{PROMPT}');

  const handleSave = async () => {
    try {
      const newSettings: AIProviderSettingsType = {
        provider,
        model,
        customEndpoint: provider === 'custom' ? {
          curlCommand,
          placeholder
        } : null
      };
      await updateSettings(newSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
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
          Configure the AI provider used for prompt augmentation and enhancement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="custom">Custom Endpoint</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {provider === 'openai' && (
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4 Opus</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4 Opus Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {provider === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>cURL Command</Label>
              <Textarea
                value={curlCommand}
                onChange={(e) => setCurlCommand(e.target.value)}
                placeholder="Enter your cURL command here"
                className="font-mono text-sm min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Enter the complete cURL command. Use the placeholder below to indicate where the prompt should be inserted.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Prompt Placeholder</Label>
              <Input
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="{PROMPT}"
              />
              <p className="text-sm text-muted-foreground">
                This text will be replaced with the actual prompt in your cURL command
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};