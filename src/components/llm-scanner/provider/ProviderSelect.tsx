import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProviderSelectProps {
  selectedProvider: string;
  onProviderChange: (value: string) => void;
}

export const ProviderSelect = ({ selectedProvider, onProviderChange }: ProviderSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Select Provider</Label>
      <Select value={selectedProvider} onValueChange={onProviderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="anthropic">Anthropic</SelectItem>
          <SelectItem value="google">Google AI</SelectItem>
          <SelectItem value="ollama">Ollama</SelectItem>
          <SelectItem value="custom">Custom Endpoint</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};