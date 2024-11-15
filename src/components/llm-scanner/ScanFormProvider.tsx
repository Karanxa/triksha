import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
}

export const ScanFormProvider = ({ provider, onProviderChange }: ScanFormProviderProps) => {
  return (
    <div className="space-y-4">
      <Label>Select Provider</Label>
      <Select value={provider} onValueChange={onProviderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="anthropic">Anthropic</SelectItem>
          <SelectItem value="google">Google AI</SelectItem>
          <SelectItem value="ollama">Ollama</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};