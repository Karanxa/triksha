import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAIProviderSettings } from "@/hooks/useAIProviderSettings";
import { useState } from "react";
import { toast } from "sonner";
import { AIProviderSettings as AIProviderSettingsType, CustomEndpoint } from "@/types/aiProvider";

export const AIProviderSettings = () => {
  const { settings, isLoading, updateSettings } = useAIProviderSettings();
  const [provider, setProvider] = useState(settings?.provider || 'openai');
  const [model, setModel] = useState(settings?.model || 'gpt-4o-mini');
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint | null>(settings?.customEndpoint || null);

  const handleSave = async () => {
    try {
      const newSettings: AIProviderSettingsType = {
        provider,
        model,
        customEndpoint: provider === 'custom' ? customEndpoint : null
      };
      await updateSettings(newSettings);
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
              <Label>Endpoint URL</Label>
              <Input
                value={customEndpoint?.url || ''}
                onChange={(e) => setCustomEndpoint(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={customEndpoint?.apiKey || ''}
                onChange={(e) => setCustomEndpoint(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key"
              />
            </div>
            <div className="space-y-2">
              <Label>Headers (JSON)</Label>
              <Input
                value={customEndpoint?.headers || ''}
                onChange={(e) => setCustomEndpoint(prev => ({ ...prev, headers: e.target.value }))}
                placeholder='{"Content-Type": "application/json"}'
              />
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